const bcrypt = require("bcrypt");
const { faker } = require("@faker-js/faker");
const { pool } = require("../lib/database");

const PASSWORD = process.env.DB_PASSWORD;
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
const shouldReset = process.argv.includes("--reset");
const dryRun = process.argv.includes("--dry-run");
const NUM_RECORDS = 1000;

const areas = ["DC", "VCO", "PPI", "CWC", "FSP", "WAREHOUSE"];
const gear = ["Gloves", "Facemask", "Coat"];
const permissionTypes = ["CLEAR WITH RECTAL", "CLEAR WITHOUT RECTAL"];

const defaultUsers = {
  employees: [
    {
      first_name: "Alexis",
      last_name: "Corporal",
      email: "corporal461@gmail.com",
      department_id: 2,
    },
  ],
  human_resources: [
    {
      first_name: "Sarha",
      last_name: "Goco",
      email: "sarha@gmail.com",
    },
  ],
  nurses: [
    {
      first_name: "Sarah",
      last_name: "Cruz",
      email: "sarah.cruz@hospital.com",
    },
  ],
  security_guards: [
    {
      first_name: "Jiro",
      last_name: "Manalo",
      email: "jiro@gmail.com",
    },
  ],
  visitors: [
    {
      first_name: "Alex",
      last_name: "Corporal",
      email: "alex@gmail.com",
      contact_number: "09171231234", // ← You can change this if needed
      address: "Quezon City", // ← You can change this if needed
    },
  ],
};

async function hashPassword() {
  return bcrypt.hash(PASSWORD, SALT_ROUNDS);
}

async function resetTables() {
  const tables = [
    "high_care_symptoms",
    "high_care_prohibited_items",
    "high_care_requests",
    "visits",
    "time_slots",
    "visitors",
    "security_guards",
    "nurses",
    "human_resources",
    "employees",
    "comments",
  ];

  for (const table of tables) {
    if (!dryRun) {
      await pool.query(`DELETE FROM ${table}`);
      await pool.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
    }
    console.log(`🧹 Reset ${table}`);
  }
}

async function insert(table, data) {
  const keys = Object.keys(data).join(", ");
  const values = Object.values(data);
  const placeholders = values.map(() => "?").join(", ");
  const sql = `INSERT INTO ${table} (${keys}) VALUES (${placeholders})`;
  if (!dryRun) {
    const [result] = await pool.query(sql, values);
    return result.insertId;
  } else {
    console.log(`🧪 Dry Run Insert into ${table}:`, data);
    return faker.number.int({ min: 100, max: 999 });
  }
}

async function seed() {
  try {
    if (shouldReset) await resetTables();

    const passwordHash = await hashPassword();

    const employeeIds = [];
    const nurseIds = [];
    const visitorIds = [];

    const insertUsers = async (table, usersList) => {
      for (const user of usersList) {
        const data = { ...user };

        if (
          table === "employees" ||
          table === "nurses" ||
          table === "visitors" ||
          table === "security_guards" ||
          table === "human_resources"
        ) {
          data.password = passwordHash;
        }

        if (table !== "employees") {
          delete data.department_id;
        }

        const id = await insert(table, data);

        if (table === "employees") employeeIds.push(id);
        if (table === "nurses") nurseIds.push(id);
        if (table === "visitors") visitorIds.push(id);
      }
    };

    const employeeTimeSlotsMap = new Map();
    const usedSlotsPerDay = new Map();

    await insertUsers("employees", defaultUsers.employees);

    // Create time slots for default employee(s)
    for (const emp of employeeIds.slice(0, defaultUsers.employees.length)) {
      const defaultEmployeeSlots = [];
      const defaultDates = [new Date(), new Date(Date.now() + 86400000)]; // today and tomorrow

      for (const dateObj of defaultDates) {
        const date = dateObj.toISOString().split("T")[0];

        const availableHours = Array.from({ length: 5 }, (_, i) => i + 9); // 09–13
        for (const hour of availableHours) {
          const start = `${String(hour).padStart(2, "0")}:00:00`;
          const end = `${String(hour + 1).padStart(2, "0")}:00:00`;

          const slotId = await insert("time_slots", {
            employee_id: emp,
            date,
            start_time: start,
            end_time: end,
          });

          defaultEmployeeSlots.push({ id: slotId, start, end, date });
        }
      }

      employeeTimeSlotsMap.set(emp, defaultEmployeeSlots);
    }

    for (let i = 0; i < NUM_RECORDS; i++) {
      const departmentId = faker.number.int({ min: 1, max: 5 });

      const emp = await insert("employees", {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: `${faker.internet.username().toLowerCase()}_${i}@gmail.com`,
        department_id: departmentId,
        password: passwordHash,
      });
      employeeIds.push(emp);

      const employeeSlots = [];
      const numDates = faker.number.int({ min: 3, max: 5 });
      const datePool = [];

      for (let d = 0; d < numDates; d++) {
        const date = faker.date.soon({ days: 14 }).toISOString().split("T")[0];
        datePool.push(date);
      }

      for (const date of datePool) {
        const availableHours = Array.from({ length: 10 }, (_, i) => i + 7); // 07–16
        faker.helpers.shuffle(availableHours);

        const numSlots = faker.number.int({ min: 3, max: 6 });

        for (let s = 0; s < numSlots && availableHours.length > 0; s++) {
          const startHour = availableHours.shift();
          const endHour = startHour + 1;
          if (endHour > 17) break;

          const pad = (n) => String(n).padStart(2, "0");
          const start = `${pad(startHour)}:00:00`;
          const end = `${pad(endHour)}:00:00`;

          const slotId = await insert("time_slots", {
            employee_id: emp,
            date,
            start_time: start,
            end_time: end,
          });

          employeeSlots.push({ id: slotId, start, end, date });
        }
      }

      employeeTimeSlotsMap.set(emp, employeeSlots);

      const nurse = await insert("nurses", {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: `${faker.internet.username().toLowerCase()}${i}@gmail.com`,
        password: passwordHash,
      });
      nurseIds.push(nurse);

      const visitor = await insert("visitors", {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: `${faker.internet.username().toLowerCase()}${i}@gmail.com`,
        contact_number: faker.helpers.replaceSymbols("09#########"),
        address: faker.location.streetAddress(),
        password: passwordHash,
      });
      visitorIds.push(visitor);

      const commentId = await insert("comments", {
        content: faker.lorem.sentence(),
      });

      const visitDate = faker.date
        .recent({ days: 14 })
        .toISOString()
        .split("T")[0];
      const employeeSlotsToday = employeeTimeSlotsMap.get(emp);
      let selectedSlot;
      for (const slot of employeeSlotsToday) {
        const slotKey = `${emp}|${slot.date}|${slot.id}`;
        if (!usedSlotsPerDay.has(slotKey)) {
          usedSlotsPerDay.set(slotKey, true);
          selectedSlot = slot;
          break;
        }
      }

      if (!selectedSlot) continue;

      function to12HourFormat(timeStr) {
        const [hourStr, minute] = timeStr.split(":");
        let hour = parseInt(hourStr, 10);
        const suffix = hour >= 12 ? "P.M." : "A.M.";
        hour = hour % 12 || 12;
        return `${hour}:${minute} ${suffix}`;
      }

      const expectedTime = `${to12HourFormat(selectedSlot.start)} - ${to12HourFormat(selectedSlot.end)}`;

      const visitId = await insert("visits", {
        visitor_id: visitor,
        visited_employee_id: emp,
        visit_date: visitDate,
        approval_status_id: faker.helpers.arrayElement([1, 2, 3, 4, 6, 7]),
        time_slot_id: selectedSlot.id,
        expected_time: expectedTime,
        status_id: 1,
        valid_id_type_id: 1,
        purpose_id: 1,
        comment_id: commentId,
        device_type: faker.commerce.product(),
        device_brand: faker.company.name(),
      });

      const highCareId = await insert("high_care_requests", {
        visit_id: visitId,
        approved_by_nurse_id: nurse,
        is_approved: 1,
        approved_at: new Date(),
        areas: faker.helpers.arrayElements(areas, 2).join(", "),
        equipment: faker.helpers.arrayElements(gear, 2).join(", "),
        permission_type: faker.helpers.arrayElement(permissionTypes),
        comments: faker.lorem.sentence(),
      });

      await insert("high_care_prohibited_items", {
        high_care_request_id: highCareId,
        mobile_phone: 1,
        camera: 0,
        medicines: 0,
        notebook: 1,
        earrings: 0,
        other_prohibited_items: "",
        ring: 1,
        id_card: 1,
        ballpen: 0,
        wristwatch: 1,
        necklace: 0,
      });

      await insert("high_care_symptoms", {
        high_care_request_id: highCareId,
        fever: 0,
        cough: 0,
        open_wound: 0,
        nausea: 0,
        other_allergies: "",
        recent_places: faker.location.city(),
        skin_boils: 0,
        skin_allergies: 0,
        diarrhea: 0,
        open_sores: 0,
      });
    }

    await insertUsers("human_resources", defaultUsers.human_resources);
    await insertUsers("nurses", defaultUsers.nurses);
    await insertUsers("security_guards", defaultUsers.security_guards);
    await insertUsers("visitors", defaultUsers.visitors);
    // Extend Default Users With Data Like Faker Accounts
    const defaultEmployeeId = employeeIds[0]; // First employee is Alexis Corporal
    const defaultNurseId = nurseIds[0]; // First nurse is Sarah Cruz
    const defaultVisitorId = visitorIds[0]; // First visitor is Alex Corporal

    // Generate time slots for default employee
    const defaultTimeSlots = [];
    const defaultDates = [new Date(), new Date(Date.now() + 86400000)]; // today + tomorrow

    for (const dateObj of defaultDates) {
      const date = dateObj.toISOString().split("T")[0];
      const hours = [9, 10, 11, 13, 14]; // 9AM–3PM, skipping lunch

      for (const hour of hours) {
        const pad = (n) => String(n).padStart(2, "0");
        const start = `${pad(hour)}:00:00`;
        const end = `${pad(hour + 1)}:00:00`;

        const slotId = await insert("time_slots", {
          employee_id: defaultEmployeeId,
          date,
          start_time: start,
          end_time: end,
        });

        defaultTimeSlots.push({ id: slotId, start, end, date });
      }
    }

    // Pick a time slot for a default visit
    const selectedSlot = defaultTimeSlots[0]; // First available

    // Format to 12-hour format
    function to12HourFormat(timeStr) {
      const [hourStr, minute] = timeStr.split(":");
      let hour = parseInt(hourStr, 10);
      const suffix = hour >= 12 ? "P.M." : "A.M.";
      hour = hour % 12 || 12;
      return `${hour}:${minute} ${suffix}`;
    }

    const expectedTime = `${to12HourFormat(selectedSlot.start)} - ${to12HourFormat(selectedSlot.end)}`;
    const visitDate = selectedSlot.date;

    // Create a comment
    const defaultCommentId = await insert("comments", {
      content: "Excited to meet with the employee.",
    });

    // Create a visit
    const defaultVisitId = await insert("visits", {
      visitor_id: defaultVisitorId,
      visited_employee_id: defaultEmployeeId,
      visit_date: visitDate,
      approval_status_id: 1,
      time_slot_id: selectedSlot.id,
      expected_time: expectedTime,
      status_id: 1,
      valid_id_type_id: 1,
      purpose_id: 1,
      comment_id: defaultCommentId,
      device_type: "Laptop",
      device_brand: "Apple",
    });

    // Add high care request
    const defaultHighCareId = await insert("high_care_requests", {
      visit_id: defaultVisitId,
      approved_by_nurse_id: defaultNurseId,
      is_approved: 1,
      approved_at: new Date(),
      areas: "DC, PPI",
      equipment: "Gloves, Facemask",
      permission_type: "CLEAR WITHOUT RECTAL",
      comments: "No issues reported.",
    });

    // Add prohibited items
    await insert("high_care_prohibited_items", {
      high_care_request_id: defaultHighCareId,
      mobile_phone: 1,
      camera: 0,
      medicines: 0,
      notebook: 1,
      earrings: 0,
      other_prohibited_items: "USB Stick",
      ring: 1,
      id_card: 1,
      ballpen: 0,
      wristwatch: 1,
      necklace: 0,
    });

    //  Add symptoms
    await insert("high_care_symptoms", {
      high_care_request_id: defaultHighCareId,
      fever: 0,
      cough: 0,
      open_wound: 0,
      nausea: 0,
      other_allergies: "None",
      recent_places: "Makati",
      skin_boils: 0,
      skin_allergies: 0,
      diarrhea: 0,
      open_sores: 0,
    });

    console.log(`✅ Seeding ${dryRun ? "previewed" : "complete"}.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
