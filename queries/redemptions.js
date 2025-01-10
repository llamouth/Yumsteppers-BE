const { db } = require('../db/dbConfig');
const QRCode = require('qrcode');

const getAllRedemptions = async () => {
    try {
        const allRedemptions = await db.manyOrNone('SELECT * FROM redemptions');
        return allRedemptions;
    } catch (error) {
        throw new Error(`Error fetching all redemptions: ${error.message}`);
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
        return await db.tx(async (t) => {
            const newRedemption = await t.one(
                'INSERT INTO redemptions (reward_id, user_id) VALUES ($1, $2) RETURNING *',
                [reward_id, user_id]
            );
            return newRedemption;
        });
    } catch (error) {
        throw new Error(`Error creating redemption: ${error.message}`);
    }
};

const updateRedemption = async (id, redemption) => {
    try {
        const { reward_id, user_id } = redemption;
        const updatedRedemption = await db.oneOrNone(
            'UPDATE redemptions SET reward_id=$1, user_id=$2 WHERE id=$3 RETURNING *',
            [reward_id, user_id, id]
        );
        return updatedRedemption;
    } catch (error) {
        throw new Error(`Error updating redemption: ${error.message}`);
    }
};

async function verifyRedemption(rewardId, userId) {
    try {
        return await db.tx(async t => {
            console.log("Verifying redemption for:", { rewardId, userId });  // Debug log
            
            // Check if reward is redeemable
            const redemptionQuery = `
                UPDATE user_rewards
                SET redeemed = true, redemptions_count = redemptions_count + 1
                WHERE reward_id = $1 AND user_id = $2 AND redemptions_count < 3
                RETURNING *;
            `;
            const redemptionResult = await t.oneOrNone(redemptionQuery, [rewardId, userId]);
            console.log("Redemption update result:", redemptionResult);  // Debug log

            if (!redemptionResult) {
                throw new Error("Reward not found or already fully redeemed.");
            }

            // Generate QR code after verifying and deducting points
            const qrCodeData = JSON.stringify({ userId, rewardId, redeemed_at: new Date() });
            const qr_code_url = await QRCode.toDataURL(qrCodeData);
            console.log("Generated QR Code URL:", qr_code_url);

            return {
                redemption: redemptionResult,
                qr_code_url  // Include the QR code URL in the return object
            };
        });
    } catch (error) {
        console.error("Error verifying redemption:", error.message);
        throw error;
    }
}

const deleteRedemption = async (id) => {
    try {
        const deletedRedemption = await db.oneOrNone(
            'UPDATE redemptions SET deleted=TRUE WHERE id=$1 RETURNING *',
            [id]
        );
        return deletedRedemption;
    } catch (error) {
        throw new Error(`Error deleting redemption: ${error.message}`);
    }
};

const getUserRedemptions = async (user_id) => {
    try {
        const userRedemptions = await db.any(
            `SELECT r.*, rw.details AS reward_details, rw.expiration_date, rw.points_required
             FROM redemptions r
             JOIN rewards rw ON r.reward_id = rw.id
             WHERE r.user_id = $1 AND r.deleted = FALSE
             ORDER BY r.redemption_date DESC`,
            [user_id]
        );
        return userRedemptions;
    } catch (error) {
        console.error(`Error fetching redemptions for user ${user_id}:`, error);
        throw new Error(`Error fetching user redemptions: ${error.message}`);
    }
};

module.exports = { 
    getAllRedemptions, 
    getSingleRedemption, 
    createRedemption, 
    updateRedemption, 
    deleteRedemption, 
    getUserRedemptions,
    verifyRedemption
};
