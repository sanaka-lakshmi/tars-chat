import { v } from 'convex/values'
import { query } from './_generated/server'

export const getUnreadCount = query({
  args: { userId: v.id('users'), conversationId: v.id('conversations') },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('userConversationUnreads')
      .withIndex('by_user_conversation', q =>
        q.eq('userId', args.userId).eq('conversationId', args.conversationId)
      )
      .first()
    return existing?.unreadCount ?? 0
  },
})
