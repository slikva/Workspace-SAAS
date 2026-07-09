require("dotenv").config();

const express = require("express");
const { AccessToken } = require("livekit-server-sdk");
const { google } = require("googleapis");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
async function createGoogleMeet(
    title,
    description,
    startDateTime,
    endDateTime
) {
    console.log("createGoogleMeet() called");

    oauth2Client.setCredentials(global.gmailTokens);

    const calendar = google.calendar({

        version: "v3",

        auth: oauth2Client

    });

    const event = {

        summary: title,

        description: description,

        start: {

            dateTime: startDateTime,

            timeZone: "Asia/Kolkata"

        },

        end: {

            dateTime: endDateTime,

            timeZone: "Asia/Kolkata"

        },

        conferenceData: {

            createRequest: {

                requestId: Date.now().toString(),

                conferenceSolutionKey: {

                    type: "hangoutsMeet"

                }

            }

        }

    };

   const response = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: event
});

console.log("Google Calendar Response:");
console.log(JSON.stringify(response.data, null, 2));

return response.data.hangoutLink;
}
const { initializeApp, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

const app = express();

const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(null, uploadPath);

  },

  filename: (req, file, cb) => {

    cb(null, `${Date.now()}-${file.originalname}`);

  }

});

const upload = multer({
  storage
});
const memoryUpload = multer({
  storage: multer.memoryStorage()
});

const pool = require("./db");
const cors = require("cors");
app.use(express.json());
app.use(cors());
const nodemailer = require("nodemailer"); 
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "workspace.saas.ac@gmail.com",
    pass: "kxpzfrlygfjmfyxs"
  }
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

await transporter.sendMail({
  from: '"SHNOOR WorkSpace" <workspace.saas.demo@gmail.com>',
  to: email,
  subject: "Welcome to SHNOOR WorkSpace",
  html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Welcome to SHNOOR WorkSpace</title>
</head>

<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:40px 0;">

<tr>
<td align="center">

<table width="650" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08);">

<!-- Header -->

<tr>

<td align="center"
style="background:#163F68;padding:40px;">

<img
src="./public/shnoor_international_logo.png"
width="120"
alt="SHNOOR Logo"
style="display:block;margin-bottom:15px;"
>

<h1
style="color:#ffffff;margin:0;font-size:32px;">
SHNOOR WorkSpace
</h1>

<p
style="color:#d8e8f8;margin-top:10px;font-size:15px;">
Enterprise Collaboration Platform
</p>

</td>

</tr>

<!-- Welcome -->

<tr>

<td style="padding:45px;">

<h2
style="margin-top:0;color:#163F68;">
Welcome, ${full_name}!
</h2>

<p
style="color:#555;font-size:16px;line-height:28px;">

Your account has been successfully created in
<strong>SHNOOR WorkSpace.</strong>

You can now securely access your workspace using the credentials below.

</p>

<!-- Login Details -->

<table
width="100%"
style="
margin-top:30px;
border:1px solid #e5e7eb;
border-radius:10px;
background:#f8fafc;
">

<tr>

<td
style="
padding:18px;
border-bottom:1px solid #e5e7eb;
">

<b>Email</b><br>

<span style="color:#555;">
${email}
</span>

</td>

</tr>

<tr>

<td
style="
padding:18px;
border-bottom:1px solid #e5e7eb;
">

<b>Temporary Password</b><br>

<span style="color:#555;">
${password}
</span>

</td>

</tr>

<tr>

<td
style="padding:18px;">

<b>Role</b><br>

<span style="color:#555;">
${role}
</span>

</td>

</tr>

</table>

<!-- Button -->

<div
style="
text-align:center;
margin-top:40px;
">

<a
href="https://workspace-saas.vercel.app/login"
style="
display:inline-block;
background:#163F68;
color:#ffffff;
padding:16px 40px;
text-decoration:none;
border-radius:8px;
font-size:16px;
font-weight:bold;
">

Login to WorkSpace

</a>

</div>

<!-- Notice -->

<div
style="
margin-top:35px;
padding:18px;
background:#FFF8E7;
border-left:5px solid #F59E0B;
border-radius:6px;
">

<p
style="margin:0;color:#444;line-height:26px;">

<b>Security Notice</b><br>

For your account security, please change your password immediately after your first login.

</p>

</div>

<!-- Support -->

<div
style="margin-top:40px;">

<h3
style="color:#163F68;margin-bottom:12px;">
Need Help?
</h3>

<p
style="margin:0;color:#555;line-height:28px;">

📧 workspace.saas.demo@gmail.com

<br>

🌐 https://workspace-saas.vercel.app

</p>

</div>

</td>

</tr>

<!-- Footer -->

<tr>

<td
align="center"
style="
background:#163F68;
padding:25px;
">

<p
style="
margin:0;
color:#dbeafe;
font-size:14px;
">

© 2026 SHNOOR International LLC

<br>

All Rights Reserved

</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>
</html>
`
});

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
      `
      INSERT INTO tasks
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
      RETURNING *
      `,
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

    // GET EMPLOYEE
    const employee = await pool.query(
      `
      SELECT full_name,email
      FROM users
      WHERE user_id=$1
      `,
      [assigned_to]
    );

    // GET MANAGER
    const manager = await pool.query(
      `
      SELECT full_name
      FROM users
      WHERE user_id=$1
      `,
      [assigned_by]
    );

    const employeeName = employee.rows[0]?.full_name;
    const employeeEmail = employee.rows[0]?.email;
    const managerName = manager.rows[0]?.full_name;

    console.log(employeeEmail);

    try {

      await transporter.sendMail({

        from: "workspace.saas.ac@gmail.com",

        to: employeeEmail,

        subject: " New Task Assigned",

        html: `
          <h2>Hello ${employeeName}</h2>

          <p>A new task has been assigned.</p>

          <p><b>Task:</b> ${title}</p>

          <p><b>Description:</b> ${description}</p>

          <p><b>Priority:</b> ${priority}</p>

          <p><b>Status:</b> ${status}</p>

          <p><b>Due Date:</b> ${due_date}</p>

          <p><b>Assigned By:</b> ${managerName}</p>
        `
      });

      console.log("Task email sent");

    } catch (mailErr) {

      console.error("Mail Error:", mailErr);

    }

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
      created_by,
      end_time
    } = req.body;
  const roomName = `call-${created_by}-${employee_id}-${Date.now()}`;

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
    created_by,
    room_name
)
VALUES
($1,$2,$3,$4,$5,$6,$7,$8,$9)
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
        created_by,
        roomName
      ]
    );

  
    if (meeting_type === "Employee") {

      const employee = await pool.query(
        `
        SELECT full_name,email
        FROM users
        WHERE user_id=$1
        `,
        [employee_id]
      );

      if (employee.rows.length > 0) {

        const user = employee.rows[0];

        await transporter.sendMail({

          from: "workspace.saas.ac@gmail.com",

          to: user.email,

          subject: " Meeting Invitation",

          html: `
            <h2>Hello ${user.full_name}</h2>

            <p>You have been invited to a meeting.</p>

            <hr>

            <h2>Hello ${user.full_name}</h2>

            <p>You have been invited to a meeting.</p>

            <hr>

            <p><b>Title:</b> ${title}</p>

            <p><b>Date:</b> ${meeting_date}</p>

            <p><b>Time:</b> ${meeting_time}</p>

            <p>${description}</p>

            <br>

            <a
            href="https://workspace-saas.vercel.app/meeting-room?room=${roomName}"
            style="
            background:#163F68;
            color:white;
            padding:12px 22px;
            text-decoration:none;
            border-radius:8px;
            display:inline-block;
            font-weight:bold;
            ">

            Join Workspace Meet

            </a>

            <br><br>

            <p>

            Or copy this link:

            <br>

            https://workspace-saas.vercel.app/meeting-room?room=${roomName}

            </p>

            <br>

            <p>Please login to Workspace.</p>
          `
        });

      }

    }

    
    else if (meeting_type === "Group") {

      const members = await pool.query(
        `
        SELECT
            u.full_name,
            u.email
        FROM group_members gm

        JOIN users u
        ON gm.user_id = u.user_id

        WHERE gm.group_id = $1
        `,
        [group_id]
      );

      for (const member of members.rows) {

        await transporter.sendMail({

          from: "workspace.saas.ac@gmail.com",

          to: member.email,

          subject: " Group Meeting Invitation",

          html: `
            <h2>Hello ${member.full_name}</h2>

            <p>You have been invited to a group meeting.</p>

            <hr>

            <p><b>Title:</b> ${title}</p>

            <p><b>Date:</b> ${meeting_date}</p>

            <p><b>Time:</b> ${meeting_time}</p>

            <p>${description}</p>

            <br>

            <p>Please login to Workspace.</p>
          `
        });

      }

    }

    res.json(result.rows[0]);

  } catch (err) {

    console.log("====================================");
    console.log("MEETING CREATION ERROR");
    console.log("====================================");

    console.error(err);

    console.log("Message:", err.message);

    if (err.errors) {
        console.log(err.errors);
    }

    if (err.response) {
        console.log(err.response.data);
    }

    res.status(500).json({
        success: false,
        message: err.message
    });

}

});
app.post("/calls/start", async (req, res) => {

    try {

        const {

            employee_id,

            created_by

        } = req.body;

        // Get employee details

        const employeeResult = await pool.query(
            `
            SELECT
                full_name,
                email
            FROM users
            WHERE user_id = $1
            `,
            [employee_id]
        );

        if (employeeResult.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });

        }

        const employee = employeeResult.rows[0];

        // Get caller details

        const managerResult = await pool.query(
            `
            SELECT
                full_name
            FROM users
            WHERE user_id = $1
            `,
            [created_by]
        );

        const manager = managerResult.rows[0];

        const now = new Date();

        const end = new Date(now);

        end.setHours(end.getHours() + 1);

        const title = `Instant Call - ${manager.full_name}`;

        const description =
            `${manager.full_name} started an instant call.`;

        
        const roomName = `call-${Date.now()}`;

        // Save Meeting

        const meeting = await pool.query(

            `
            INSERT INTO meetings
            (
                title,
                description,
                meeting_date,
                meeting_time,
                meeting_type,
                employee_id,
                created_by,
                room_name
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *
            `,

            [

                title,

                description,

                now.toISOString().split("T")[0],

                now.toTimeString().slice(0,5),

                "Employee",

                employee_id,

                created_by,

                roomName

            ]

        );

        // Send Email

        await transporter.sendMail({

            from: "workspace.saas.ac@gmail.com",

            to: employee.email,

            subject: "Instant Call Invitation",

            html: `

                <h2>Hello ${employee.full_name}</h2>

                <p>${manager.full_name} has started an instant call with you.</p>

                <br>

                <a
                    href="https://workspace-saas.vercel.app/meeting-room?room=${roomName}"
                    style="
                        background:#163F68;
                        color:white;
                        padding:12px 20px;
                        text-decoration:none;
                        border-radius:8px;
                        display:inline-block;
                    "
                >
                    Join Call
                </a>

                <br><br>

               <p>
https://workspace-saas.vercel.app/meeting-room?room=${roomName}
</p>

            `

        });

        res.json({

    success: true,

    meeting: meeting.rows[0],

    room_name: roomName,

    meeting_link: `https://workspace-saas.vercel.app/meeting-room?room=${roomName}`

});
    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

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
console.log("Receiver User ID:", member.user_id);
console.log("Receiver Name:", receiver.rows[0]);
console.log("Receiver Token:", token);
console.log("Sending notification...");

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
      SET status = $1
      WHERE task_id = $2
      RETURNING *
      `,
      [status, req.params.id]
    );

    const task = result.rows[0];

   
    const employee = await pool.query(
      `
      SELECT full_name
      FROM users
      WHERE user_id = $1
      `,
      [task.assigned_to]
    );

    
    const manager = await pool.query(
      `
      SELECT email, full_name
      FROM users
      WHERE user_id = $1
      `,
      [task.assigned_by]
    );

    if (manager.rows.length > 0) {

      const managerEmail = manager.rows[0].email;
      const managerName = manager.rows[0].full_name;
      const employeeName = employee.rows[0].full_name;

      await transporter.sendMail({

        from: "workspace.saas.ac@gmail.com",

        to: managerEmail,

        subject: ` Task Status Updated`,

        html: `
          <h2>Hello ${managerName}</h2>

          <p>Your employee has updated a task.</p>

          <hr>

          <p><b>Employee:</b> ${employeeName}</p>

          <p><b>Task:</b> ${task.title}</p>

          <p><b>Current Status:</b> ${status}</p>

          <br>

          <p>Please login to Workspace for more details.</p>
        `
      });

    }

    res.json({
      success: true,
      task
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
    console.log("Sending notification to:", req.body.user_id);
    console.log("Receiver token:", token);
    await getMessaging().send({

      token,

      notification: {

        title: "Workspace",

        body: " Push Notifications are working!"

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


app.get("/auth/google", (req, res) => {

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/calendar"
    ]
  });

  res.redirect(url);

});
app.get("/auth/google/callback", async (req, res) => {

  try {

    const { tokens } = await oauth2Client.getToken(req.query.code);

    oauth2Client.setCredentials(tokens);

    console.log("Access Token:");
    console.log(tokens.access_token);

    console.log("Refresh Token:");
    console.log(tokens.refresh_token);
    global.gmailTokens = tokens;

    res.send(`
      <h2>Gmail Connected Successfully</h2>
      <p>You can close this page.</p>
    `);

  } catch (err) {

    console.error(err);

    res.status(500).send("Authentication Failed");

  }

});
app.get("/gmail/inbox", async (req, res) => {

  try {

    oauth2Client.setCredentials(global.gmailTokens);

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client
    });

    const list = await gmail.users.messages.list({
      userId: "me",
      maxResults: 20,
    });

    const emails = [];

    for (const message of list.data.messages || []) {

      const mail = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
      });

      const headers = mail.data.payload.headers;

      const getHeader = (name) =>
        headers.find(h => h.name === name)?.value || "";

     const bodyPart = mail.data.payload.parts
  ? mail.data.payload.parts.find(
      part => part.mimeType === "text/plain"
    )
  : mail.data.payload;

let body = "";

if (bodyPart?.body?.data) {

  body = Buffer.from(
    bodyPart.body.data,
    "base64"
  )
    .toString("utf8")
    .replace(/\0/g, "");

}

emails.push({

  id: mail.data.id,

  from: getHeader("From"),

  to: getHeader("To"),

  subject: getHeader("Subject"),

  date: getHeader("Date"),

  snippet: mail.data.snippet,

  body,

  starred: mail.data.labelIds?.includes("STARRED")

});

    }

    res.json(emails);

  } catch (err) {

    console.error(err);

    res.status(500).json(err);

  }

});

app.post("/gmail/send", memoryUpload.array("attachments"), async (req, res) => {

  try {

    oauth2Client.setCredentials(global.gmailTokens);

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client
    });

    const { to, subject, body } = req.body;

    const attachments = req.files || [];

    const boundary = "workspace_mail_boundary";

let message = [

  `To: ${to}`,

  "MIME-Version: 1.0",

  `Subject: ${subject}`,

  `Content-Type: multipart/mixed; boundary="${boundary}"`,

  "",

  `--${boundary}`,

  "Content-Type: text/html; charset=UTF-8",

  "",

  body,

  ""

];
attachments.forEach(file => {

    message.push(

        `--${boundary}`,

        `Content-Type: ${file.mimetype}; name="${file.originalname}"`,

        "Content-Transfer-Encoding: base64",

        `Content-Disposition: attachment; filename="${file.originalname}"`,

        "",

        file.buffer.toString("base64"),

        ""

    );

});
message.push(

    `--${boundary}--`

);

message = message.join("\n");

    const encodedMessage = Buffer
      .from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({

      userId: "me",

      requestBody: {

        raw: encodedMessage

      }

    });

    res.json({

      success: true

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({

      success: false,

      error: err.message

    });

  }

});
app.post("/gmail/archive", async (req, res) => {

  try {

    oauth2Client.setCredentials(global.gmailTokens);

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client
    });

    const { messageId } = req.body;

    await gmail.users.messages.modify({

      userId: "me",

      id: messageId,

      requestBody: {

        removeLabelIds: ["INBOX"]

      }

    });

    res.json({

      success: true

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({

      success: false,

      error: err.message

    });

  }

});
app.get("/gmail/starred", async (req, res) => {

  try {

    oauth2Client.setCredentials(global.gmailTokens);

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client
    });

    const list = await gmail.users.messages.list({

      userId: "me",

      labelIds: ["STARRED"],

      maxResults: 20

    });

    const emails = [];

    for (const message of list.data.messages || []) {

      const mail = await gmail.users.messages.get({

        userId: "me",

        id: message.id

      });

      const headers = mail.data.payload.headers;

      const getHeader = (name) =>
        headers.find(h => h.name === name)?.value || "";

      const bodyPart = mail.data.payload.parts
        ? mail.data.payload.parts.find(
            part => part.mimeType === "text/plain"
          )
        : mail.data.payload;

      let body = "";

      if (bodyPart?.body?.data) {

        body = Buffer.from(
          bodyPart.body.data,
          "base64"
        )
          .toString("utf8")
          .replace(/\0/g, "");

      }

      emails.push({

        id: mail.data.id,

        from: getHeader("From"),

        to: getHeader("To"),

        subject: getHeader("Subject"),

        date: getHeader("Date"),

        snippet: mail.data.snippet,

        body,
        starred: mail.data.labelIds?.includes("STARRED")

      });

    }

    res.json(emails);

  } catch (err) {

    console.error(err);

    res.status(500).json(err);

  }

});
app.get("/gmail/important", async (req, res) => {

  try {

    oauth2Client.setCredentials(global.gmailTokens);

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client
    });

    const list = await gmail.users.messages.list({

      userId: "me",

      labelIds: ["IMPORTANT"],

      maxResults: 20

    });

    const emails = [];

    for (const message of list.data.messages || []) {

      const mail = await gmail.users.messages.get({

        userId: "me",

        id: message.id

      });

      const headers = mail.data.payload.headers;

      const getHeader = (name) =>
        headers.find(h => h.name === name)?.value || "";

      const bodyPart = mail.data.payload.parts
        ? mail.data.payload.parts.find(
            part => part.mimeType === "text/plain"
          )
        : mail.data.payload;

      let body = "";

      if (bodyPart?.body?.data) {

        body = Buffer.from(
          bodyPart.body.data,
          "base64"
        ).toString("utf8").replace(/\0/g, "");

      }

      emails.push({

        id: mail.data.id,

        from: getHeader("From"),

        to: getHeader("To"),

        subject: getHeader("Subject"),

        date: getHeader("Date"),

        snippet: mail.data.snippet,

        body,

        labels: mail.data.labelIds || []

      });

    }

    res.json(emails);

  } catch (err) {

    console.error(err);

    res.status(500).json(err);

  }

});
app.get("/gmail/spam", async (req, res) => {

  try {

    oauth2Client.setCredentials(global.gmailTokens);

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client
    });

    const list = await gmail.users.messages.list({

      userId: "me",

      labelIds: ["SPAM"],

      maxResults: 20

    });

    const emails = [];

    for (const message of list.data.messages || []) {

      const mail = await gmail.users.messages.get({

        userId: "me",

        id: message.id

      });

      const headers = mail.data.payload.headers;

      const getHeader = (name)=>
        headers.find(h=>h.name===name)?.value || "";

      const bodyPart = mail.data.payload.parts
        ? mail.data.payload.parts.find(
            part=>part.mimeType==="text/plain"
          )
        : mail.data.payload;

      let body="";

      if(bodyPart?.body?.data){

        body=Buffer.from(
          bodyPart.body.data,
          "base64"
        ).toString("utf8").replace(/\0/g,"");

      }

      emails.push({

        id:mail.data.id,

        from:getHeader("From"),

        to:getHeader("To"),

        subject:getHeader("Subject"),

        date:getHeader("Date"),

        snippet:mail.data.snippet,

        body,

        labels:mail.data.labelIds || []

      });

    }

    res.json(emails);

  } catch(err){

    console.error(err);

    res.status(500).json(err);

  }

});
app.get("/gmail/sent", async (req, res) => {

  try {

    oauth2Client.setCredentials(global.gmailTokens);

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client
    });

    const list = await gmail.users.messages.list({

      userId: "me",

      labelIds: ["SENT"],

      maxResults: 20

    });

    const emails = [];

    for (const message of list.data.messages || []) {

      const mail = await gmail.users.messages.get({

        userId: "me",

        id: message.id

      });

      const headers = mail.data.payload.headers;

      const getHeader = (name) =>
        headers.find(h => h.name === name)?.value || "";

      const bodyPart = mail.data.payload.parts
        ? mail.data.payload.parts.find(
            part => part.mimeType === "text/plain"
          )
        : mail.data.payload;

      let body = "";

      if (bodyPart?.body?.data) {

        body = Buffer.from(bodyPart.body.data, "base64")
          .toString("utf8")
          .replace(/\0/g, "");

      }

      emails.push({

        id: mail.data.id,

        from: getHeader("From"),

        to: getHeader("To"),

        subject: getHeader("Subject"),

        date: getHeader("Date"),

        snippet: mail.data.snippet,

        body,
        starred: mail.data.labelIds?.includes("STARRED")

      });

    }

    res.json(emails);

  } catch (err) {

    console.error(err);

    res.status(500).json(err);

  }

});
app.get("/gmail/drafts", async (req, res) => {

  try {

    oauth2Client.setCredentials(global.gmailTokens);

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client
    });

    const list = await gmail.users.drafts.list({

      userId: "me"

    });

    const emails = [];

    for (const draft of list.data.drafts || []) {

      const mail = await gmail.users.drafts.get({

        userId: "me",

        id: draft.id

      });

      const headers = mail.data.message.payload.headers;

      const getHeader = (name) =>
        headers.find(h => h.name === name)?.value || "";

      const bodyPart = mail.data.message.payload.parts
        ? mail.data.message.payload.parts.find(
            part => part.mimeType === "text/plain"
          )
        : mail.data.message.payload;

      let body = "";

      if (bodyPart?.body?.data) {

        body = Buffer.from(bodyPart.body.data, "base64")
          .toString("utf8")
          .replace(/\0/g, "");

      }

      emails.push({

        id: mail.data.message.id,

        from: getHeader("From"),

        to: getHeader("To"),

        subject: getHeader("Subject"),

        date: getHeader("Date"),

        snippet: mail.data.message.snippet,

        body,
        starred: mail.data.message.labelIds?.includes("STARRED")

      });

    }

    res.json(emails);

  } catch (err) {

    console.error(err);

    res.status(500).json(err);

  }

});
app.get("/gmail/archive", async (req, res) => {

  try {

    oauth2Client.setCredentials(global.gmailTokens);

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client
    });

    const list = await gmail.users.messages.list({

      userId: "me",

      labelIds: ["CATEGORY_PERSONAL"],

      q: "-label:INBOX",

      maxResults: 20

    });

    const emails = [];

    for (const message of list.data.messages || []) {

      const mail = await gmail.users.messages.get({

        userId: "me",

        id: message.id

      });

      const headers = mail.data.payload.headers;

      const getHeader = (name) =>
        headers.find(h => h.name === name)?.value || "";

      const bodyPart = mail.data.payload.parts
        ? mail.data.payload.parts.find(
            part => part.mimeType === "text/plain"
          )
        : mail.data.payload;

      let body = "";

      if (bodyPart?.body?.data) {

        body = Buffer.from(bodyPart.body.data, "base64")
          .toString("utf8")
          .replace(/\0/g, "");

      }

      emails.push({

        id: mail.data.id,

        from: getHeader("From"),

        to: getHeader("To"),

        subject: getHeader("Subject"),

        date: getHeader("Date"),

        snippet: mail.data.snippet,

        body,
        starred: mail.data.labelIds?.includes("STARRED")

      });

    }

    res.json(emails);

  } catch (err) {

    console.error(err);

    res.status(500).json(err);

  }

});
app.get("/gmail/trash", async (req, res) => {

  try {

    oauth2Client.setCredentials(global.gmailTokens);

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client
    });

    const list = await gmail.users.messages.list({

      userId: "me",

      labelIds: ["TRASH"],

      maxResults: 20

    });

    const emails = [];

    for (const message of list.data.messages || []) {

      const mail = await gmail.users.messages.get({

        userId: "me",

        id: message.id

      });

      const headers = mail.data.payload.headers;

      const getHeader = (name) =>
        headers.find(h => h.name === name)?.value || "";

      const bodyPart = mail.data.payload.parts
        ? mail.data.payload.parts.find(
            part => part.mimeType === "text/plain"
          )
        : mail.data.payload;

      let body = "";

      if (bodyPart?.body?.data) {

        body = Buffer.from(bodyPart.body.data, "base64")
          .toString("utf8")
          .replace(/\0/g, "");

      }

      emails.push({

        id: mail.data.id,

        from: getHeader("From"),

        to: getHeader("To"),

        subject: getHeader("Subject"),

        date: getHeader("Date"),

        snippet: mail.data.snippet,

        body,
        starred: mail.data.labelIds?.includes("STARRED")

      });

    }

    res.json(emails);

  } catch (err) {

    console.error(err);

    res.status(500).json(err);

  }

});
app.post("/gmail/trash", async (req, res) => {

  try {

    oauth2Client.setCredentials(global.gmailTokens);

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client
    });

    const { messageId } = req.body;

    await gmail.users.messages.trash({

      userId: "me",

      id: messageId

    });

    res.json({

      success: true

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({

      success: false,

      error: err.message

    });

  }

});
app.post("/gmail/star", async (req, res) => {

  try {

    oauth2Client.setCredentials(global.gmailTokens);

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client
    });

    const { messageId } = req.body;

    await gmail.users.messages.modify({

      userId: "me",

      id: messageId,

      requestBody: {

        addLabelIds: ["STARRED"]

      }

    });

    res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

});
app.post("/gmail/unstar", async (req, res) => {

  try {

    oauth2Client.setCredentials(global.gmailTokens);

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client
    });

    const { messageId } = req.body;

    await gmail.users.messages.modify({

      userId: "me",

      id: messageId,

      requestBody: {

        removeLabelIds: ["STARRED"]

      }

    });

    res.json({

      success: true

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({

      success: false,

      error: err.message

    });

  }

});

app.get("/gmail/counts", async (req, res) => {

    try {

        oauth2Client.setCredentials(global.gmailTokens);

        const gmail = google.gmail({
            version: "v1",
            auth: oauth2Client
        });

        async function getCount(options) {

            const result = await gmail.users.messages.list({
                userId: "me",
                maxResults: 1,
                ...options
            });

            return result.data.resultSizeEstimate || 0;

        }

        const counts = {

            inbox: await getCount({
                labelIds: ["INBOX"],
                q: "is:unread"
            }),

            starred: await getCount({
                labelIds: ["STARRED"],
                q: "is:unread"
            }),

            important: await getCount({
                labelIds: ["IMPORTANT"],
                q: "is:unread"
            }),

            sent: await getCount({
                labelIds: ["SENT"],
                q: "is:unread"
            }),

            drafts: (await gmail.users.drafts.list({
                userId: "me"
            })).data.drafts?.length || 0,

            archive: await getCount({
                q: "-label:INBOX"
            }),

            spam: await getCount({
                labelIds: ["SPAM"]
            }),

            trash: await getCount({
                labelIds: ["TRASH"]
            })

        };

        res.json(counts);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

});


app.get("/livekit/token", async (req, res) => {

    try {

        const token = new AccessToken(
            process.env.LIVEKIT_API_KEY,
            process.env.LIVEKIT_API_SECRET,
            {
                identity: "Vasavi",
                name: "Vasavi"
            }
        );

        token.addGrant({
            roomJoin: true,
            room: "workspace-demo",
            canPublish: true,
            canSubscribe: true
        });

        res.json({
            success: true,
            token: await token.toJwt(),
            url: process.env.LIVEKIT_URL
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});
app.post("/livekit/token", async (req, res) => {

    try {

        const {

            roomName,

            participantName

        } = req.body;

        if (!roomName || !participantName) {

            return res.status(400).json({

                success: false,

                message: "roomName and participantName are required"

            });

        }

        const token = new AccessToken(

            process.env.LIVEKIT_API_KEY,

            process.env.LIVEKIT_API_SECRET,

            {

                identity: participantName,

                name: participantName

            }

        );

        token.addGrant({

            roomJoin: true,

            room: roomName,

            canPublish: true,

            canSubscribe: true,

            canPublishData: true

        });

        res.json({

            success: true,

            token: await token.toJwt(),

            url: process.env.LIVEKIT_URL

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});



const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
