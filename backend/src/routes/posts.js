const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new post
router.post('/', authenticate, async (req, res) => {
    try {
        const { title, content, imageUrl, postType, visibility, tags } = req.body;
        const userId = req.user.id;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const db = await getDB();
        const postsCollection = db.collection('posts');
        const usersCollection = db.collection('users');

        const newPost = {
            title,
            content,
            imageUrl,
            postType: postType || 'post',
            visibility: visibility || 'public',
            tags: tags || [],
            authorId: new ObjectId(userId),
            createdAt: new Date(),
            updatedAt: new Date(),
            likes: [],
            comments: [],
        };

        const result = await postsCollection.insertOne(newPost);
        
        const author = await usersCollection.findOne(
            { _id: new ObjectId(userId) },
            { projection: { password: 0 } }
        );

        res.status(201).json({
            ...newPost,
            id: result.insertedId,
            author: {
                id: author._id,
                name: author.name,
                email: author.email,
                role: author.role,
                profile: author.profile || null
            },
            _count: {
                likes: 0,
                comments: 0
            }
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Get all posts with pagination
router.get('/', authenticate, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const db = await getDB();
        const postsCollection = db.collection('posts');

        const posts = await postsCollection.aggregate([
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'authorInfo'
                }
            },
            { $unwind: '$authorInfo' },
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'postId',
                    as: 'comments'
                }
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    title: 1,
                    content: 1,
                    imageUrl: 1,
                    postType: 1,
                    visibility: 1,
                    tags: 1,
                    createdAt: 1,
                    author: {
                        id: '$authorInfo._id',
                        name: '$authorInfo.name',
                        email: '$authorInfo.email',
                        role: '$authorInfo.role',
                        profile: '$authorInfo.profile'
                    },
                    likes: { $size: '$likes' },
                    comments: { $size: '$comments' },
                    isLiked: { $in: [new ObjectId(req.user.id), '$likes'] }
                }
            }
        ]).toArray();
        
        const totalPosts = await postsCollection.countDocuments();

        res.json({
            posts,
            totalPages: Math.ceil(totalPosts / parseInt(limit)),
            currentPage: parseInt(page),
            totalPosts
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Get a single post by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        const db = await getDB();
        const postsCollection = db.collection('posts');

        const post = await postsCollection.aggregate([
            { $match: { _id: new ObjectId(id) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'authorInfo'
                }
            },
            { $unwind: '$authorInfo' },
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'postId',
                    as: 'commentsInfo'
                }
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    title: 1,
                    content: 1,
                    imageUrl: 1,
                    postType: 1,
                    visibility: 1,
                    tags: 1,
                    createdAt: 1,
                    author: {
                        id: '$authorInfo._id',
                        name: '$authorInfo.name',
                        email: '$authorInfo.email',
                        role: '$authorInfo.role',
                        profile: '$authorInfo.profile'
                    },
                    likes: { $size: '$likes' },
                    comments: { $size: '$commentsInfo' },
                    isLiked: { $in: [new ObjectId(req.user.id), '$likes'] }
                }
            }
        ]).next();

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// Update a post
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, imageUrl, postType, visibility, tags } = req.body;
        const userId = req.user.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        const db = await getDB();
        const postsCollection = db.collection('posts');

        const post = await postsCollection.findOne({ _id: new ObjectId(id) });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if the authenticated user is the author of the post
        if (post.authorId.toString() !== userId) {
            return res.status(403).json({ error: 'Not authorized to update this post' });
        }

        const updatedPost = {
            ...post,
            title,
            content,
            imageUrl,
            postType: postType || post.postType,
            visibility: visibility || post.visibility,
            tags: tags || post.tags,
            updatedAt: new Date(),
        };

        await postsCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedPost });

        res.json(updatedPost);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// Like a post
router.post('/:id/like', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        const db = await getDB();
        const postsCollection = db.collection('posts');

        const post = await postsCollection.findOne({ _id: new ObjectId(id) });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {
            return res.status(400).json({ error: 'Post already liked' });
        }

        post.likes.push(userId);

        await postsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { likes: post.likes } });

        res.status(200).json({ message: 'Post liked successfully' });
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ error: 'Failed to like post' });
    }
});

// Unlike a post
router.post('/:id/unlike', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        const db = await getDB();
        const postsCollection = db.collection('posts');

        const post = await postsCollection.findOne({ _id: new ObjectId(id) });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const alreadyLiked = post.likes.includes(userId);

        if (!alreadyLiked) {
            return res.status(400).json({ error: 'Post not liked yet' });
        }

        post.likes = post.likes.filter(like => like !== userId);

        await postsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { likes: post.likes } });

        res.status(200).json({ message: 'Post unliked successfully' });
    } catch (error) {
        console.error('Error unliking post:', error);
        res.status(500).json({ error: 'Failed to unlike post' });
    }
});

// Get all likes for a post
router.get('/:id/likes', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        const db = await getDB();
        const postsCollection = db.collection('posts');

        const post = await postsCollection.findOne({ _id: new ObjectId(id) });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const usersCollection = db.collection('users');
        const likedUsers = await usersCollection.find({ _id: { $in: post.likes.map(id => new ObjectId(id)) } }).project({ password: 0 }).toArray();

        res.json(likedUsers);
    } catch (error) {
        console.error('Error fetching likes:', error);
        res.status(500).json({ error: 'Failed to fetch likes' });
    }
});

// Get comments for a post
router.get('/:id/comments', authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        const db = await getDB();
        const commentsCollection = db.collection('comments');

        const comments = await commentsCollection.aggregate([
            { $match: { postId: new ObjectId(id) } },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'authorInfo'
                }
            },
            { $unwind: '$authorInfo' },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    content: 1,
                    createdAt: 1,
                    author: {
                        id: '$authorInfo._id',
                        name: '$authorInfo.name',
                        email: '$authorInfo.email',
                        role: '$authorInfo.role',
                        profile: '$authorInfo.profile'
                    }
                }
            }
        ]).toArray();

        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// Delete a post
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        const db = await getDB();
        const postsCollection = db.collection('posts');
        const commentsCollection = db.collection('comments');

        const post = await postsCollection.findOne({ _id: new ObjectId(id) });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Add role-based deletion logic if needed, e.g. admins can delete any post
        if (post.authorId.toString() !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }

        // Delete the post and its comments
        await commentsCollection.deleteMany({ postId: new ObjectId(id) });
        await postsCollection.deleteOne({ _id: new ObjectId(id) });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

module.exports = router;