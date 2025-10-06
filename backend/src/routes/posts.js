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
        const postsCollection = db.collection('Post');
        const usersCollection = db.collection('User');

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
        const postsCollection = db.collection('Post');

        const posts = await postsCollection.aggregate([
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'User',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'authorInfo'
                }
            },
            { $unwind: '$authorInfo' },
            {
                $lookup: {
                    from: 'Comment',
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
        const postsCollection = db.collection('Post');

        const post = await postsCollection.aggregate([
            { $match: { _id: new ObjectId(id) } },
            {
                $lookup: {
                    from: 'User',
                    localField: 'authorId',
                    foreignField: '_id',
                    as: 'authorInfo'
                }
            },
            { $unwind: '$authorInfo' },
            {
                $lookup: {
                    from: 'Comment',
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

// Like a post
router.post('/:id/like', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        const db = await getDB();
        const postsCollection = db.collection('Post');

        const result = await postsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $addToSet: { likes: new ObjectId(userId) } }
        );

        if (result.modifiedCount === 0) {
            // If no document was modified, it might be because the user already liked the post
            // or the post doesn't exist. We can check if the user is already in the likes array.
            const post = await postsCollection.findOne({ _id: new ObjectId(id), likes: new ObjectId(userId) });
            if (post) {
                return res.status(200).json({ message: 'Post already liked' });
            }
            return res.status(404).json({ error: 'Post not found or already liked' });
        }

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
        const postsCollection = db.collection('Post');

        const result = await postsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $pull: { likes: new ObjectId(userId) } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'Post not found or not liked by user' });
        }

        res.status(200).json({ message: 'Post unliked successfully' });
    } catch (error) {
        console.error('Error unliking post:', error);
        res.status(500).json({ error: 'Failed to unlike post' });
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
        const postsCollection = db.collection('Post');
        const commentsCollection = db.collection('Comment');

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

// Get all posts with pagination
router.get('/', authenticate, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const posts = await prisma.post.findMany({
            skip,
            take: parseInt(limit),
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        profile: true
                    }
                },
                likes: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                profile: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            }
        });

        const total = await prisma.post.count();

        res.json({
            posts,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Like/Unlike a post
router.post('/:postId/like', authenticate, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        // Check if user already liked the post
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });

        if (existingLike) {
            // Unlike the post
            await prisma.like.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId
                    }
                }
            });
        } else {
            // Like the post
            await prisma.like.create({
                data: {
                    userId,
                    postId
                }
            });
        }

        // Get updated post
        const updatedPost = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                likes: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        likes: true
                    }
                }
            }
        });

        res.json({
            liked: !existingLike,
            post: updatedPost
        });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ error: 'Failed to toggle like' });
    }
});

// Add a comment to a post
router.post('/:postId/comments', authenticate, async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content) {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                authorId: userId,
                postId
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        profile: true
                    }
                }
            }
        });

        res.status(201).json(comment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
});

// Get comments for a post
router.get('/:postId/comments', authenticate, async (req, res) => {
    try {
        const { postId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const comments = await prisma.comment.findMany({
            where: {
                postId
            },
            skip,
            take: parseInt(limit),
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        profile: true
                    }
                }
            }
        });

        const total = await prisma.comment.count({
            where: { postId }
        });

        res.json({
            comments,
            pagination: {
                total,
                pages: Math.ceil(total / parseInt(limit)),
                currentPage: parseInt(page)
            }
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// Delete a comment
router.delete('/comments/:commentId', authenticate, async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        // Check if user is the author of the comment
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.authorId !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }

        await prisma.comment.delete({
            where: { id: commentId }
        });

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

module.exports = router;