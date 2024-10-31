const { db } = require('../db/dbConfig');

const getAllRedemptions = async () => {
    try {
        const allRedemptions = await db.manyOrNone('SELECT * FROM redemptions');
        return allRedemptions;
    } catch (error) {
        throw new Error('Error fetching all redemptions: ' + error.message);
    }
};

const getSingleRedemption = async (id) => {
    try {
        const singleRedemption = await db.oneOrNone('SELECT * FROM redemptions WHERE id=$1', [id]);
        return singleRedemption;
    } catch (error) {
        return error;
    }
};

const createRedemption = async (redemption) => {
    try {
        const { reward_id, user_id } = redemption;
        const currentMonthStart = new Date().toISOString.slice(0, 7);

        return await db.tx(async t => {
            const count = await t.one(
                `SELECT COUNT(*) FROM redemptions
                WHERE user_id = $1 AND reward_id = $2 AND to_char(redemption_date, 'YYYY-MM') = $3`,
                [user_id, reward_id, currentMonthStart]
            );

            if(parseInt(count.count) >= 3) {
                throw new Error('Redemption limit reached for this month');
            }

            const newRedemption = await t.one(
                'INSERT INTO redemptions (reward_id, user_id) VALUES ($1, $2) RETURNING *',
                [reward_id, user_id]
            );

            return newRedemption;
        })
    } catch (error) {
        throw new Error('Error creathing redemption: '. error.message)
    }
}

const updateRedemption = async (id, redemption) => {
    try {
        const { reward_id, user_id } = redemption;
        const updatedRedemption = await db.oneOrNone(
            'UPDATE redemptions SET reward_id=$1, user_id=$2 WHERE id=$3 RETURNING *',
            [reward_id, user_id, id]
        );
        return updatedRedemption;
    } catch (error) {
        return error;
    }
};

const deleteRedemption = async (id) => {
    try {
        const deletedRedemption = await db.oneOrNone(
            'DELETE FROM redemptions WHERE id=$1 RETURNING *',
            [id]
        );
        return deletedRedemption;
    } catch (error) {
        return error;
    }
};

module.exports = { 
    getAllRedemptions, 
    getSingleRedemption, 
    createRedemption, 
    updateRedemption, 
    deleteRedemption 
};