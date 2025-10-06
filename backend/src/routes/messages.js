const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// Create a new conversation or get existing one
router.post('/conversations', authenticate, async (req, res) => {
    try {
        const { participantId } = req.body;
        const userId = req.user.id;

        if (!participantId) {
            return res.status(400).json({ error: 'Participant ID is required' });
        }

        // Check if conversation already exists between these users
        const existingConversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { id: userId } } },
                    { participants: { some: { id: participantId } } }
                ]
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profile: true
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 20
                }
            }
        });

        if (existingConversation) {
            return res.json(existingConversation);
        }

        // Create new conversation
        const newConversation = await prisma.conversation.create({
            data: {
                participants: {
                    connect: [
                        { id: userId },
                        { id: participantId }
                    ]
                }
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profile: true
                    }
                }
            }
        });

        res.status(201).json(newConversation);
    } catch (error) {
        console.error('Error in create conversation:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
});

// Get all conversations for the current user
router.get('/conversations', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        id: userId
                    }
                }
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profile: true
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1 // Get only the latest message
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        res.json(conversations);
    } catch (error) {
        console.error('Error in get conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', authenticate, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;
        const { before } = req.query; // For pagination

        // Verify user is part of the conversation
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: {
                    some: {
                        id: userId
                    }
                }
            }
        });

        if (!conversation) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Get messages with pagination
        const messages = await prisma.message.findMany({
            where: {
                conversationId,
                ...(before && {
                    createdAt: {
                        lt: new Date(before)
                    }
                })
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profile: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 20
        });

        res.json(messages);
    } catch (error) {
        console.error('Error in get messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Send a message
router.post('/conversations/:conversationId/messages', authenticate, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content) {
            return res.status(400).json({ error: 'Message content is required' });
        }

        // Verify user is part of the conversation
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: {
                    some: {
                        id: userId
                    }
                }
            }
        });

        if (!conversation) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Create the message
        const message = await prisma.message.create({
            data: {
                content,
                senderId: userId,
                conversationId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profile: true
                    }
                }
            }
        });

        // Update conversation's updatedAt
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('Error in create message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router;