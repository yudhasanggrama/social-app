export const cacheKeys = {
    threadsFeed: (page = "1") => `threads:feed:page:${page}`,
    threadDetail: (id: string) => `threads:detail:${id}`,
    myThreads: (userId: string | number) => `threads:me:${userId}`,
    userThreads: (userId: string) => `threads:user:${userId}`,

    // Replies
    repliesByThread: (threadId: string) => `replies:thread:${threadId}`,

    // Profile / Users
    myProfile: (userId: string | number) => `profile:me:${userId}`,
    userByUsername: (username: string) => `profile:user:${username}`,

    // Search
    searchUsers: (q: string, limit = "10") => `search:users:q=${q}:limit=${limit}`,

    // Follows
    followsList: (userId: string | number, type: string) => `follows:list:${userId}:${type}`,
    suggestedUsers: (userId: string | number, limit = "5") => `follows:suggested:${userId}:limit=${limit}`,
};
