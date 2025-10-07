const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Add a comment to a post
router.post('/posts/:postId/comments', authenticate, async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        // Basic validation
        if (!content?.trim()) {
            return res.status(400).json({ error: 'Comment content is required' });
        }
        
        if (!ObjectId.isValid(postId)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        const db = await getDB();
        const postsCollection = db.collection('posts');
        const commentsCollection = db.collection('comments');
        const usersCollection = db.collection('users');

        // Verify the post exists
        const post = await postsCollection.findOne({ _id: new ObjectId(postId) });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Create the comment
        const newComment = {
            content,
            authorId: new ObjectId(userId),
            postId: new ObjectId(postId),
            createdAt: new Date(),
            updatedAt: new Date(),
            likes: [],
        };
        
        const result = await commentsCollection.insertOne(newComment);
        
        const author = await usersCollection.findOne(
            { _id: new ObjectId(userId) },
            { projection: { password: 0 } }
        );

        res.status(201).json({
            ...newComment,
            id: result.insertedId,
            author: {
                id: author._id,
                name: author.name,
                role: author.role,
                profile: {
                    avatarUrl: author.avatarUrl || null
                }
            }
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
});

// Get comments for a post
router.get('/posts/:postId/comments', authenticate, async (req, res) => {
    try {
        const { postId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        if (!ObjectId.isValid(postId)) {
            return res.status(400).json({ error: 'Invalid post ID' });
        }

        const db = await getDB();
        const commentsCollection = db.collection('Comment');

        // Get comments with pagination and author info
        const comments = await commentsCollection.aggregate([
            { $match: { postId: new ObjectId(postId) } },
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
                $project: {
                    _id: 0,
                    id: '$_id',
                    content: 1,
                    createdAt: 1,
                    author: {
                        id: '$authorInfo._id',
                        name: '$authorInfo.name',
                        role: '$authorInfo.role',
                        profile: {
                            avatarUrl: '$authorInfo.avatarUrl'
                        }
                    }
                }
            }
        ]).toArray();

        // Get total count of comments
        const totalComments = await commentsCollection.countDocuments({ postId: new ObjectId(postId) });

        res.json({
            comments,
            totalPages: Math.ceil(totalComments / parseInt(limit)),
            currentPage: parseInt(page),
            totalComments
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// Update a comment
router.put('/comments/:commentId', authenticate, async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!ObjectId.isValid(commentId)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }

        const db = await getDB();
        const commentsCollection = db.collection('Comment');

        const comment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.authorId.toString() !== userId) {
            return res.status(403).json({ error: 'Not authorized to update this comment' });
        }

        const updatedComment = await commentsCollection.findOneAndUpdate(
            { _id: new ObjectId(commentId) },
            { $set: { content, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );

        res.json(updatedComment.value);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Failed to update comment' });
    }
});

// Delete a comment
router.delete('/comments/:commentId', authenticate, async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        if (!ObjectId.isValid(commentId)) {
            return res.status(400).json({ error: 'Invalid comment ID' });
        }

        const db = await getDB();
        const commentsCollection = db.collection('Comment');

        const comment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.authorId.toString() !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }

        await commentsCollection.deleteOne({ _id: new ObjectId(commentId) });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

module.exports = router;