const {db} = require('../db/dbConfig')
const QRCode = require('qrcode')

const getAllRewards = async () => {
    try {
        const allRewards = await db.any('SELECT * FROM rewards WHERE deleted = FALSE');
        return allRewards;
    } catch (error) {
        throw new Error(`Error fetching all rewards: ${error.message}`);
    }
};

const getSingleReward = async (id) => {
    try {
        const singleReward = await db.oneOrNone('SELECT * FROM rewards WHERE id=$1 AND deleted = FALSE', [id])
        return singleReward
    } catch (error) {
        throw new Error(`Error fetching reward with id=${id}: ${error.message}`);
    }
};

const createReward = async (reward) => {
    try {
        const { details, expiration_date, restaurant_id, points_required } = reward;

        if(new Date(expiration_date) <= new Date()) {
            throw new Error('Expiration date must be in the future.');
        }

        if(typeof points_required !== "number" || points_required < 0) {
            throw new Error('Points required must be non-negative number.');
        }

        const initialQrData = {};
        // console.log("Generated QR Code:", qrGenerated);

        const qrGeneratedInitial = await QRCode.toDataURL(JSON.stringify(initialQrData));

        const newRewardQuery = `
            INSERT INTO rewards (
                qr_code,
                date_generated,
                details,
                expiration_date,
                restaurant_id,
                points_required
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, reward_secret
        `;
        
        const newReward = await db.one(newRewardQuery, [
            qrGeneratedInitial,
            new Date(),
            details,
            expiration_date,
            restaurant_id,
            points_required
        ]);

        const { id: rewardId, reward_secret: rewardSecret } = newReward;

        const finalQrData = {
            reward_id: rewardId,
            secret: rewardSecret
        };

        const finalGeneratedQr = await QRCode.toDataURL(JSON.stringify(finalQrData));

        const updateQrQuery = `
            UPDATE rewards
            SET qr_code=$1
            WHERE id=$2
        `;
        await db.none(updateQrQuery, [finalGeneratedQr, rewardId]);

        const finalReward = await db.one('SELECT * FROM rewards WHERE id=$1', [rewardId])

        return finalReward
    } catch (error) {
        throw new Error(`Error creating reward: ${error.message}`);
    }
}

const updateReward = async ( id, reward ) => {
    try {
        const { 
            date_generated, 
            details, 
            expiration_date,  
            restaurant_id, 
            points_required 
        } = reward

        const existingReward = await db.oneOrNone(
            'SELECT date_generated FROM rewards WHERE id=$1', 
            [id]
        );

        if(!existingReward) {
            throw new Error(`Reward with id=${id} not found, cannot update`);
        }

        if(expiration_date && new Date(expiration_date) <= new Date()) {
            throw new Error('Expiration date must be in the future.');
        }

        if (
            points_required !== undefined && 
            (typeof points_required !== 'number' || points_required < 0)
        ) {
            throw new Error('Points required must be non-negative number');
        }

        const dateGeneratedToUpdate = date_generated || existingReward.date_generated;

        const qrData = {
            reward_id: id,
            secret: existingReward.reward_secret
        }

        const qrGenerated = await QRCode.toDataURL(JSON.stringify(qrData));

        const updatedReward = await db.one(
            `
            UPDATE rewards 
            SET 
                qr_code=$1, 
                date_generated=$2, 
                details=$3, 
                expiration_date=$4,  
                restaurant_id=$5, 
                points_required=$6
            WHERE id=$7 AND deleted=FALSE
            RETURNING *
            `, 
            [qrGenerated, dateGeneratedToUpdate, details, expiration_date, restaurant_id, points_required, id]
        );
        
        return updatedReward
    } catch (error) {
        throw new Error(`Error updating reward with id=${id}: ${error.message}`);
    }

}

const deleteReward = async (id) => {
    try {
        const removedReward = await db.oneOrNone('UPDATE rewards SET deleted = TRUE WHERE id = $1 AND deleted = FALSE RETURNING *', [id]);
        
        if (!removedReward) {
            throw new Error(`Reward with id=%{id} not found or already deleted`);
        }
        return removedReward;
    } catch (error) {
        throw new Error(`Error deleting reward with id=${id}: ${error.message}`);
    }
};


module.exports = { 
    getAllRewards, 
    getSingleReward, 
    createReward, 
    deleteReward, 
    updateReward 
};