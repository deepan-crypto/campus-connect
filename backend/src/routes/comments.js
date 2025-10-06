const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

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

        // Verify the post exists
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Create the comment
        const comment = await prisma.comment.create({
            data: {
                content,
                author: { connect: { id: userId } },
                post: { connect: { id: postId } }
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        profile: {
                            select: {
                                avatarUrl: true
                            }
                        }
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
router.get('/posts/:postId/comments', authenticate, async (req, res) => {
    try {
        const { postId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Verify the post exists
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Get comments with pagination
        const comments = await prisma.comment.findMany({
            where: { postId },
            skip,
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        profile: {
                            select: {
                                avatarUrl: true
                            }
                        }
                    }
                }
            }
        });

        // Get total count of comments
        const totalComments = await prisma.comment.count({
            where: { postId }
        });

        res.json({
            comments,
            pagination: {
                total: totalComments,
                pages: Math.ceil(totalComments / parseInt(limit)),
                currentPage: parseInt(page),
                hasMore: skip + comments.length < totalComments
            }
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// Delete a comment (only the author can delete their comment)
router.delete('/comments/:commentId', authenticate, async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: { author: true }
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Only allow the comment author to delete their comment
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