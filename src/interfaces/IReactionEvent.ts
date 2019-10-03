export default interface IReactionEvent {
    /**
     * Event type e.g. `MESSAGE_REACTION_ADD`
     */
    t: string;
    s: number;
    op: 0;
    d: {
        user_id: string;
        message_id: string;
        emoji: {
            name: string;
            id: string | null;
            animated: boolean;
        };
        channel_id: string;
        guild_id: string;
    };
}
