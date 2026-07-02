const express = require("express");
const { initializeApp, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});
const app = express();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname;

    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const pool = require("./db");
const cors = require("cors");

app.use(express.json());
app.use(cors());
const nodemailer = require("nodemailer"); 
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
transporter.verify((error, success) => {

  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP READY");
  }

});




app.use("/uploads", express.static(uploadPath));
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Error");
  }
});
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database Error");
  }
});
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials"
      });
    }
    const user = result.rows[0];
    res.json({ success: true, user_id: user.user_id, full_name: user.full_name, role: user.role, email: user.email
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error"
    });
  }
});
app.get("/test-login", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1 AND password=$2", ["owner@workspace.com", "123456"]
  );
  res.json(result.rows);
});
app.post("/users", async (req, res) => {

  try {

    const {
      company_id,
      full_name,
      email,
      password,
      role
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO users
      (
        company_id,
        full_name,
        email,
        password,
        role
      )
      VALUES
      ($1,$2,$3,$4,$5)
      RETURNING *
      `,
      [
        company_id,
        full_name,
        email,
        password,
        role
      ]
    );

    

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (err) {

  console.error("========== SMTP ERROR ==========");
  console.error(err);
  console.error("Message:", err.message);
  console.error("Code:", err.code);
  console.error("Response:", err.response);

  res.status(500).json({
    success: false,
    message: err.message,
  });


  }

});
app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1",[id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({success: false, message: "User not found"});
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {full_name,email,role} = req.body;
    const result = await pool.query( `UPDATE users SET full_name=$1,email=$2, role=$3 WHERE user_id=$4 RETURNING *`, [full_name, email, role, id]);
    res.json({ success: true, user: result.rows[0]});
  } catch (err) {
    console.error(err);
    res.status(500).json({success: false,message: "Update Failed"});
  }
});
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE user_id = $1",[id]);
    res.json({success: true,message: "User Deleted"});
  } catch (err) {
    console.error(err);
    res.status(500).json({success: false,message: "Delete Failed"});
  }
});
app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query( `SELECT t.*, u.full_name AS employee_name FROM tasks t LEFT JOIN users u ON t.assigned_to = u.user_id ORDER BY t.task_id `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({success: false, message: "Failed to fetch tasks" });
  }
});
app.get("/my-tasks/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query( `SELECT t.*, u.full_name AS employee_name FROM tasks t  LEFT JOIN users u ON t.assigned_to = u.user_id WHERE t.assigned_to = $1 ORDER BY t.task_id `,[userId]);

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });

  }
});

app.post("/tasks", async (req, res) => {
  try {

    const {
      assigned_by,
      assigned_to,
      title,
      description,
      status,
      priority,
      due_date
    } = req.body;

    const result = await pool.query(
      `INSERT INTO tasks
      (
        assigned_by,
        assigned_to,
        title,
        description,
        status,
        priority,
        due_date
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [
        assigned_by,
        assigned_to,
        title,
        description,
        status,
        priority,
        due_date
      ]
    );

    res.json({
      success: true,
      task: result.rows[0]
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Task Creation Failed"
    });

  }
});

app.get("/meetings", async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
        m.*,
        u.full_name AS employee_name,
        g.group_name
      FROM meetings m

      LEFT JOIN users u
      ON m.employee_id = u.user_id

      LEFT JOIN groups g
      ON m.group_id = g.group_id

      ORDER BY
      m.meeting_date ASC,
      m.meeting_time ASC
      `
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).send("Database Error");

  }

});
app.get("/meetings/:userId/:role", async (req, res) => {

  try {

    const { userId, role } = req.params;

    let result;

    if (role === "Manager") {

      result = await pool.query(`
        SELECT
          m.*,
          u.full_name AS employee_name,
          cg.group_name
        FROM meetings m
        LEFT JOIN users u
          ON m.employee_id = u.user_id
        LEFT JOIN chat_groups cg
          ON m.group_id = cg.group_id
        ORDER BY meeting_date ASC
      `);

    } else {

      result = await pool.query(
        `
        SELECT
          m.*,
          u.full_name AS employee_name,
          cg.group_name
        FROM meetings m

        LEFT JOIN users u
          ON m.employee_id = u.user_id

        LEFT JOIN chat_groups cg
          ON m.group_id = cg.group_id

        LEFT JOIN group_members gm
          ON gm.group_id = m.group_id

        WHERE
          m.employee_id = $1
          OR gm.user_id = $1

        ORDER BY meeting_date ASC
        `,
        [userId]
      );

    }

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).send("Error");

  }

});

app.post("/meetings", async (req, res) => {

  try {

    const {
      title,
      description,
      meeting_date,
      meeting_time,
      meeting_type,
      employee_id,
      group_id,
      created_by
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO meetings
      (
        title,
        description,
        meeting_date,
        meeting_time,
        meeting_type,
        employee_id,
        group_id,
        created_by
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        title,
        description,
        meeting_date,
        meeting_time,
        meeting_type,
        employee_id || null,
        group_id || null,
        created_by
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to create meeting"
    });

  }

});

app.get("/groups", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM chat_groups"
  );

  res.json(result.rows);
});

app.post("/groups", async (req, res) => {

  const { group_name, created_by } = req.body;

  const result = await pool.query(
    `INSERT INTO chat_groups
    (group_name, created_by)
    VALUES ($1,$2)
    RETURNING *`,
    [group_name, created_by]
  );

  res.json(result.rows[0]);
});

app.get("/messages/:groupId", async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
        m.*,
        u.full_name
      FROM messages m
      JOIN users u
        ON m.sender_id = u.user_id
      WHERE m.group_id = $1
      ORDER BY m.created_at ASC
      `,
      [req.params.groupId]
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Error loading messages"
    });

  }

});
app.post("/messages", async (req, res) => {

  try {

    const {
      group_id,
      sender_id,
      message,
      file_url,
      file_name,
      file_type,
    } = req.body;
    const result = await pool.query(
      `
      INSERT INTO messages
      (
        group_id,
        sender_id,
        message,
        file_url,
        file_name,
        file_type
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        group_id,
        sender_id,
        message,
        file_url,
        file_name,
        file_type,
      ]
    );
    const sender = await pool.query(
      `
      SELECT full_name
      FROM users
      WHERE user_id = $1
      `,
      [sender_id]
    );

    const senderName = sender.rows[0].full_name;
    console.log("Sender:", senderName);
    const members = await pool.query(
      `
      SELECT user_id
      FROM group_members
      WHERE group_id = $1
      AND user_id <> $2
      `,
      [group_id, sender_id]
    );
    console.log("Members:", members.rows);
    for (const member of members.rows) {
       console.log("Creating notification for:", member.user_id);
      await pool.query(
`
INSERT INTO notifications
(
user_id,
sender_id,
group_id,
title,
message,
type
)
VALUES
($1,$2,$3,$4,$5,$6)
`,
[
member.user_id,
sender_id,
group_id,
"New Chat Message",
`${senderName} sent a message`,
"chat"
]
);
const receiver = await pool.query(
  `
  SELECT
    fcm_token
  FROM users
  WHERE user_id = $1
  `,
  [member.user_id]
);

const token = receiver.rows[0]?.fcm_token;

if (token) {

  try {

    await getMessaging().send({

      token,

      notification: {

        title: senderName,

        body: message || "📎 Sent an attachment"

      }

    });

    console.log("Push notification sent");

  } catch (err) {

    console.error("Firebase Error:", err);

  }

}

    }

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message,
    });

  }

});
app.post("/private-chat", async (req, res) => {

  try {

    const { user1, user2 } = req.body;

    const existing = await pool.query(
      `
      SELECT cg.*
      FROM chat_groups cg
      JOIN group_members gm1
      ON cg.group_id = gm1.group_id
      JOIN group_members gm2
      ON cg.group_id = gm2.group_id
      WHERE cg.chat_type='private'
      AND gm1.user_id=$1
      AND gm2.user_id=$2
      `,
      [user1, user2]
    );

    if (existing.rows.length > 0) {
      return res.json(existing.rows[0]);
    }

    const otherUser = await pool.query(
      `
      SELECT full_name
      FROM users
      WHERE user_id=$1
      `,
      [user2]
    );

    const chat = await pool.query(
      `
      INSERT INTO chat_groups
      (group_name,created_by,chat_type)
      VALUES ($1,$2,'private')
      RETURNING *
      `,
      [otherUser.rows[0].full_name, user1]
    );

    const groupId = chat.rows[0].group_id;

    await pool.query(
      `
      INSERT INTO group_members(group_id,user_id)
      VALUES ($1,$2),($1,$3)
      `,
      [groupId, user1, user2]
    );

    res.json(chat.rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).send("Error");

  }

});
app.put("/notifications/read-group/:groupId/:userId", async (req, res) => {

  try {

    const result = await pool.query(
      `
      UPDATE notifications
      SET is_read = true
      WHERE group_id = $1
      AND user_id = $2
      RETURNING *;
      `,
      [
        Number(req.params.groupId),
        Number(req.params.userId)
      ]
    );

    console.log("Group:", req.params.groupId);
    console.log("User:", req.params.userId);
    console.log("Rows Updated:", result.rowCount);

    res.json({
      success: true,
      updated: result.rowCount
    });

  } catch (err) {

    console.error(err);

    res.status(500).send("Error");

  }

});
app.get("/group-unread/:userId", async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
        group_id,
        COUNT(*) AS unread
      FROM notifications
      WHERE user_id = $1
      AND is_read = false
      GROUP BY group_id
      `,
      [req.params.userId]
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).send("Error");

  }

});
app.post("/group-members", async (req, res) => {
  try {

    const { group_id, user_id } = req.body;

    const result = await pool.query(
      `
      INSERT INTO group_members(group_id,user_id)
      VALUES($1,$2)
      RETURNING *
      `,
      [group_id, user_id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});
app.get("/group-members/:groupId", async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
        u.user_id,
        u.full_name
      FROM group_members gm
      JOIN users u
      ON gm.user_id = u.user_id
      WHERE gm.group_id = $1
      ORDER BY u.full_name
      `,
      [req.params.groupId]
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).send("Error");

  }

});
app.get("/messages/:groupId", async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
        m.*,
        u.full_name
      FROM messages m
      JOIN users u
      ON m.sender_id = u.user_id
      WHERE m.group_id = $1
      ORDER BY m.created_at
      `,
      [req.params.groupId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }

});
app.delete(
  "/group-members/:groupId/:userId",
  async (req, res) => {

    try {

      await pool.query(
        `
        DELETE FROM group_members
        WHERE group_id=$1
        AND user_id=$2
        `,
        [
          req.params.groupId,
          req.params.userId
        ]
      );

      res.json({
        success: true
      });

    } catch (err) {
      console.error(err);

      res.status(500).send("Error");
    }
  }
);
app.delete("/messages/:id", async (req, res) => {

  try {

    await pool.query(
      "DELETE FROM messages WHERE message_id=$1",
      [req.params.id]
    );

    res.json({
      success: true
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }

});

app.get("/my-tasks/:userId", async (req, res) => {
  try {

    const result = await pool.query(
      `
      SELECT
        t.*,
        u.full_name AS employee_name
      FROM tasks t
      LEFT JOIN users u
      ON t.assigned_to = u.user_id
      WHERE t.assigned_to = $1
      `,
      [req.params.userId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false
    });
  }
});

app.get("/my-groups/:userId", async (req, res) => {
  try {

    const result = await pool.query(
      `
      SELECT cg.*
      FROM chat_groups cg
      JOIN group_members gm
      ON cg.group_id = gm.group_id
      WHERE gm.user_id = $1
      `,
      [req.params.userId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

app.delete("/messages/:id", async (req, res) => {
  await pool.query(
  "DELETE FROM message_reactions WHERE message_id=$1",
  [req.params.id]
);

await pool.query(
  "DELETE FROM messages WHERE message_id=$1",
  [req.params.id]
);
});

app.post("/reactions", async (req, res) => {

  try {

    const {
      message_id,
      user_id,
      reaction
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO message_reactions
      (message_id,user_id,reaction)
      VALUES ($1,$2,$3)
      RETURNING *
      `,
      [
        message_id,
        user_id,
        reaction
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).send("Error");

  }
});
app.get(
  "/reactions/:messageId",
  async (req, res) => {

    try {

      const result = await pool.query(
        `
        SELECT *
        FROM message_reactions
        WHERE message_id=$1
        `,
        [req.params.messageId]
      );

      res.json(result.rows);

    } catch (err) {

      console.error(err);

      res.status(500).send("Error");

    }
  }
);

app.put("/tasks/:id/status", async (req, res) => {

  try {

    const { status } = req.body;

    const result = await pool.query(
      `
      UPDATE tasks
      SET status=$1
      WHERE task_id=$2
      RETURNING *
      `,
      [status, req.params.id]
    );

    res.json({
      success: true,
      task: result.rows[0]
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });

  }
});
app.get("/dashboard-stats", async (req, res) => {

  try {

    const users = await pool.query(
      "SELECT COUNT(*) FROM users"
    );

    const tasks = await pool.query(
      "SELECT COUNT(*) FROM tasks"
    );

    const pendingTasks = await pool.query(
      "SELECT COUNT(*) FROM tasks WHERE status='Pending'"
    );

    const meetings = await pool.query(
      "SELECT COUNT(*) FROM meetings"
    );

    res.json({
      totalUsers: users.rows[0].count,
      totalTasks: tasks.rows[0].count,
      pendingTasks: pendingTasks.rows[0].count,
      totalMeetings: meetings.rows[0].count
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});
app.get("/recent-activities", async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
        title,
        status,
        created_at
      FROM tasks
      ORDER BY created_at DESC
      LIMIT 5
      `
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).send("Error");

  }
});
app.get("/employee-dashboard/:userId", async (req, res) => {

  try {

    const { userId } = req.params;

    const myTasks = await pool.query(
      `SELECT COUNT(*) FROM tasks
       WHERE assigned_to=$1`,
      [userId]
    );

    const pendingTasks = await pool.query(
      `SELECT COUNT(*) FROM tasks
       WHERE assigned_to=$1
       AND status='Pending'`,
      [userId]
    );

    const completedTasks = await pool.query(
      `SELECT COUNT(*) FROM tasks
       WHERE assigned_to=$1
       AND status='Completed'`,
      [userId]
    );

    const meetings = await pool.query(
      `SELECT COUNT(*) FROM meetings`
    );

    const recentTasks = await pool.query(
      `SELECT *
       FROM tasks
       WHERE assigned_to=$1
       ORDER BY task_id DESC`,
      [userId]
    );

    res.json({
      myTasks: myTasks.rows[0].count,
      pendingTasks: pendingTasks.rows[0].count,
      completedTasks: completedTasks.rows[0].count,
      meetings: meetings.rows[0].count,
      recentTasks: recentTasks.rows
    });

  } catch (err) {

    console.log(err);

    res.status(500).send("Error");

  }

});
app.delete("/groups/:id", async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query(
      "DELETE FROM group_members WHERE group_id=$1",
      [id]
    );

    await pool.query(
      "DELETE FROM messages WHERE group_id=$1",
      [id]
    );

    await pool.query(
      "DELETE FROM chat_groups WHERE group_id=$1",
      [id]
    );

    res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });

  }

});
app.put("/groups/:id", async (req, res) => {

  try {

    const { id } = req.params;
    const { group_name } = req.body;

    const result = await pool.query(
      `
      UPDATE chat_groups
      SET group_name=$1
      WHERE group_id=$2
      RETURNING *
      `,
      [group_name, id]
    );

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).send("Error");

  }

});
app.delete("/meetings/:id", async (req, res) => {

  try {

    await pool.query(
      "DELETE FROM meetings WHERE meeting_id=$1",
      [req.params.id]
    );

    res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).send("Error");

  }

});

app.get("/owner-dashboard", async (req, res) => {

  try {

    const companies = await pool.query(
      "SELECT COUNT(*) FROM companies"
    );

    const managers = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role='Manager'"
    );

    const employees = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role='Employee'"
    );

    const revenue = await pool.query(
      `
      SELECT
      COALESCE(
      SUM(monthly_revenue),
      0
      ) AS revenue
      FROM companies
      `
    );

    const recentCompanies =
      await pool.query(
        `
        SELECT *
        FROM companies
        ORDER BY company_id DESC
        LIMIT 5
        `
      );

    res.json({

      totalCompanies:
        companies.rows[0].count,

      totalManagers:
        managers.rows[0].count,

      totalEmployees:
        employees.rows[0].count,

      totalRevenue:
        revenue.rows[0].revenue,

      recentCompanies:
        recentCompanies.rows

    });

  } catch (err) {

    console.error(err);

    res.status(500).send("Error");

  }

});
app.get("/companies", async (req, res) => {

  const result = await pool.query(
    "SELECT * FROM companies ORDER BY company_id"
  );

  res.json(result.rows);

});

app.post("/companies", async (req, res) => {

  const {
    company_name,
    company_email,
    subscription_plan,
    manager_name,
    manager_email,
    manager_password
  } = req.body;

  try {

    const companyResult = await pool.query(
      `
      INSERT INTO companies
      (
        company_name,
        company_email,
        subscription_plan
      )
      VALUES ($1,$2,$3)
      RETURNING company_id
      `,
      [
        company_name,
        company_email,
        subscription_plan
      ]
    );

    const companyId =
      companyResult.rows[0].company_id;

    await pool.query(
      `
      INSERT INTO users
      (
        company_id,
        full_name,
        email,
        password,
        role
      )
      VALUES ($1,$2,$3,$4,'Manager')
      `,
      [
        companyId,
        manager_name,
        manager_email,
        manager_password
      ]
    );

    res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });

  }

});
app.post(
  "/register-company",
  async (req, res) => {

    const {
      company_name,
      company_email,
      manager_name,
      manager_email,
      password,
      subscription_plan
    } = req.body;

    try {

      const company =
        await pool.query(
          `
          INSERT INTO companies
          (
            company_name,
            company_email,
            subscription_plan
          )
          VALUES
          ($1,$2,$3)
          RETURNING company_id
          `,
          [
            company_name,
            company_email,
            subscription_plan
          ]
        );

      const companyId =
        company.rows[0].company_id;

      await pool.query(
        `
        INSERT INTO users
        (
          company_id,
          full_name,
          email,
          password,
          role
        )
        VALUES
        ($1,$2,$3,$4,'Manager')
        `,
        [
          companyId,
          manager_name,
          manager_email,
          password
        ]
      );

      res.json({
        success: true
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        success: false
      });

    }

  }
);
app.get("/analytics", async (req, res) => {

  try {

    const companies = await pool.query(
      "SELECT COUNT(*) FROM companies"
    );

    const managers = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role='Manager'"
    );

    const employees = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role='Employee'"
    );

    const revenue = await pool.query(
      `
      SELECT
      COALESCE(
      SUM(monthly_revenue),
      0
      ) AS revenue
      FROM companies
      `
    );

    res.json({

      companies:
        companies.rows[0].count,

      managers:
        managers.rows[0].count,

      employees:
        employees.rows[0].count,

      revenue:
        revenue.rows[0].revenue,

      growth: "12%"

    });

  } catch (err) {

    console.error(err);

    res.status(500).send("Error");

  }

});
app.get(
  "/company-details/:id",
  async (req, res) => {

    try {

      const company =
        await pool.query(
          `
          SELECT *
          FROM companies
          WHERE company_id=$1
          `,
          [req.params.id]
        );

      const users =
        await pool.query(
          `
          SELECT
          full_name,
          email,
          role
          FROM users
          WHERE company_id=$1
          `,
          [req.params.id]
        );

      res.json({
        company:
          company.rows[0],
        users:
          users.rows
      });

    } catch (err) {

      console.error(err);

      res.status(500).send("Error");

    }

  }
);
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

   const fileUrl =
  `https://${req.get("host")}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      fileName: req.file.originalname,
      fileUrl: fileUrl,
      fileType: req.file.mimetype,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "File upload failed",
    });
  }
});

app.get("/notifications/:userId", async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
        n.*,
        u.full_name
      FROM notifications n
      LEFT JOIN users u
      ON n.sender_id = u.user_id
      WHERE n.user_id = $1
      AND n.is_read = false
      ORDER BY n.created_at DESC
      `,
      [req.params.userId]
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).send("Error");

  }

});

app.get("/notifications/count/:userId", async (req, res) => {

  try {

    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT COUNT(*) AS unread
      FROM notifications
      WHERE user_id=$1
      AND is_read=false
      `,
      [userId]
    );

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Error"
    });

  }

});
app.put("/notifications/read/:id", async (req, res) => {

  try {

    await pool.query(
      `
      UPDATE notifications
      SET is_read=true
      WHERE notification_id=$1
      `,
      [req.params.id]
    );

    res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });

  }

});

app.post("/save-fcm-token", async (req, res) => {

  try {

    console.log("BODY:", req.body);

    const { user_id, token } = req.body;

    console.log("USER:", user_id);
    console.log("TOKEN:", token);

    const result = await pool.query(
      `
      UPDATE users
      SET fcm_token = $1
      WHERE user_id = $2
      RETURNING *
      `,
      [token, user_id]
    );

    console.log("UPDATED:", result.rows);

    res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });

  }

});
app.post("/test-notification", async (req, res) => {

  try {

    const { token } = req.body;

    await getMessaging().send({

      token,

      notification: {

        title: "Workspace",

        body: "🎉 Push Notifications are working!"

      }

    });

    res.json({

      success: true

    });

  } catch (err) {

    console.error(err);

    res.status(500).json(err);

  }

});




const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});