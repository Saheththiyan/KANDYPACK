import db from "../config/db.js";
import bcrypt from "bcryptjs";

export async function hashLegacyPasswords() {
  try {
    const [admins] = await db.query(`SELECT admin_id, password FROM Admin`);
    console.log("Admins fetched:", admins);

    const adminsToHash = admins.filter(
      (admin) => !/^\$2[ayb]\$.{56}$/.test(admin.password)
    );

    if (adminsToHash.length === 0) {
      console.log("No legacy passwords to hash");
      return;
    }

    console.log(`Hashing ${adminsToHash.length} legacy passwords`);

    // Hash passwords
    const hashPromises = adminsToHash.map(async (admin) => {
      console.log(`Hashing password for admin id ${admin.admin_id}`);
      const hash = await bcrypt.hash(admin.password, 10);
      console.log(`Hash generated for admin id ${admin.admin_id}: ${hash}`);
      await db.query(`UPDATE Admin SET password = ? WHERE admin_id = ?`, [
        hash,
        admin.admin_id,
      ]);
      console.log(`Hashed Password for admin id ${admin.admin_id}`);
      console.log(`Updated row for admin id ${admin.admin_id}`);
    });

    await Promise.allSettled(hashPromises);
    console.log("Legacy password hashing complete");
  } catch (error) {
    console.error("Error hashing passwords:", error);
  }
}

hashLegacyPasswords();

// // Run the script only if this file is executed directly
// if (import.meta.url === `file://${process.argv[1]}`) {
//   hashLegacyPasswords();
// }
