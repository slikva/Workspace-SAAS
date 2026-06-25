const express = require("express");
const pool = require("./db");
const cors = require("cors");
const app = express();
const nodemailer = require("nodemailer"); 
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

});


app.use(express.json());
app.use(cors());
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

      from:
        "workspace.saas.demo@gmail.com",

      to: email,

      subject:
        "Welcome to WorkSpace",

      html: `
        <div style="font-family:Arial;padding:20px">

          <h2>
            Welcome to WorkSpace
          </h2>

          <p>
            Hello ${full_name},
          </p>

          <p>
            Your account has been created successfully.
          </p>

          <hr/>

          <p>
            <strong>Email:</strong>
            ${email}
          </p>

          <p>
            <strong>Password:</strong>
            ${password}
          </p>

          <p>
            <strong>Role:</strong>
            ${role}
          </p>

          <hr/>

          <p>
            Login URL:
            http://localhost:5173/login
          </p>

        </div>
      `
    });

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to create user"
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
      "SELECT * FROM meetings ORDER BY meeting_date ASC"
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Database Error");
  }
});

app.post("/meetings", async (req, res) => {

  try {

    const {
      title,
      description,
      meeting_date,
      meeting_time,
      created_by
    } = req.body;

    const result = await pool.query(
      `INSERT INTO meetings
      (title, description, meeting_date, meeting_time, created_by)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *`,
      [
        title,
        description,
        meeting_date,
        meeting_time,
        created_by
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Database Error");
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
});
app.post("/messages", async (req, res) => {

  const {
    group_id,
    sender_id,
    message
  } = req.body;

  const result = await pool.query(
    `INSERT INTO messages
    (group_id,sender_id,message)
    VALUES ($1,$2,$3)
    RETURNING *`,
    [group_id, sender_id, message]
  );

  res.json(result.rows[0]);
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
app.post("/users", async (req, res) => {

  const {
    full_name,
    email,
    password,
    role
  } = req.body;

  await pool.query(
    `
    INSERT INTO users
    (
      full_name,
      email,
      password,
      role
    )
    VALUES ($1,$2,$3,$4)
    `,
    [
      full_name,
      email,
      password,
      role
    ]
  );

});

app.get("/test-email", async (req, res) => {

  try {

    await transporter.sendMail({

      from: "workspace.saas.ac@gmail.com",

      to: "vasavislikva@gmail.com",

      subject: "SMTP Test",

      html: `
        <h2>WorkSpace SMTP Test</h2>
        <p>If you received this email, SMTP is working.</p>
      `

    });

    res.send("Email Sent");

  } catch (err) {

    console.error(err);

    res.send(err.message);

  }

});




const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});