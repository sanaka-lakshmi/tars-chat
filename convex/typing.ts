import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// ✅ Set typing status for a user
export const setTyping = mutation({
  args: {
    conversationId: v.id('conversations'),
    userId: v.id('users'),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('typingIndicators')
      .withIndex('by_conversation', q => q.eq('conversationId', args.conversationId))
      .filter(q => q.eq(q.field('userId'), args.userId))
      .first()
    if (args.isTyping) {
      if (!existing) {
        await ctx.db.insert('typingIndicators', {
          conversationId: args.conversationId,
          userId: args.userId,
          timestamp: Date.now(),
        })
      } else {
        await ctx.db.patch(existing._id, { timestamp: Date.now() })
      }
    } else {
      if (existing) {
        await ctx.db.delete(existing._id)
      }
    }
  },
})

// ✅ Get all users currently typing in a conversation
export const getTypingUsers = query({
  args: { conversationId: v.id('conversations') },
  handler: async (ctx, args) => {
    const indicators = await ctx.db
      .query('typingIndicators')
      .withIndex('by_conversation', q => q.eq('conversationId', args.conversationId))
      .collect()
    const now = Date.now()
    // Only return fresh indicators (no deleting in a query)
    const freshIndicators = indicators.filter(t => now - t.timestamp <= 2000)
    const users = await Promise.all(
      freshIndicators.map(t => ctx.db.get(t.userId))
    )
    return users.filter(u => u !== null).map(u => ({ _id: u!._id, name: u!.name }))
  },
})

// ✅ Get typing indicators for all conversations for a user
export const getAllTypingIndicators = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query('conversations')
      .collect()
    const userConvs = conversations.filter(conv => conv.participants.includes(args.userId))
    const now = Date.now()
    const typingByConversation = {} as Record<string, any[]>
    for (const conv of userConvs) {
      const indicators = await ctx.db
        .query('typingIndicators')
        .withIndex('by_conversation', q => q.eq('conversationId', conv._id))
        .collect()
      // Only filter fresh indicators (no deleting in a query)
      const freshIndicators = indicators.filter(t => now - t.timestamp <= 2000)
      const users = await Promise.all(
        freshIndicators.map(t => ctx.db.get(t.userId))
      )
      typingByConversation[conv._id] = users
        .filter(u => u !== null)
        .map(u => ({ _id: u!._id, name: u!.name }))
    }
    return typingByConversation
  },
})
