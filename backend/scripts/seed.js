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
      first_name: "Visitor",
      last_name: "One",
      email: "visitor1@example.com",
      contact_number: "09171234567",
      address: "Makati City",
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
        const data = {
          ...user,
          password: passwordHash,
        };

        // Only include department_id if it's an employee
        if (table !== "employees") {
          delete data.department_id;
        }

        const id = await insert(table, data);

        if (table === "employees") employeeIds.push(id);
        if (table === "nurses") nurseIds.push(id);
        if (table === "visitors") visitorIds.push(id);
      }
    };

    await insertUsers("employees", defaultUsers.employees, true);
    for (const empId of employeeIds) {
      await insert("time_slots", {
        employee_id: empId,
        start_time: "08:00:00",
        end_time: "10:00:00",
      });
    }
    await insertUsers("human_resources", defaultUsers.human_resources);
    await insertUsers("nurses", defaultUsers.nurses);
    await insertUsers("security_guards", defaultUsers.security_guards);
    await insertUsers("visitors", defaultUsers.visitors);

    const employeeTimeSlotsMap = new Map(); // Map of employeeId -> array of slot objects
    const usedSlotsPerDay = new Map(); // Map of "employeeId|date|slotId" -> true

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

      // Generate random non-overlapping time slots (e.g. 4–8 slots)
      const numSlots = faker.number.int({ min: 4, max: 8 });
      const startHourBase = 7;
      const maxHour = 17;

      const availableHours = Array.from(
        { length: maxHour - startHourBase },
        (_, i) => startHourBase + i,
      );
      faker.helpers.shuffle(availableHours); // shuffle to randomize selection

      const employeeSlots = [];

      for (let j = 0; j < numSlots && availableHours.length > 0; j++) {
        const startHour = availableHours.shift();
        const endHour = startHour + 1;

        if (endHour > maxHour) break;

        const pad = (n) => String(n).padStart(2, "0");
        const start = `${pad(startHour)}:00:00`;
        const end = `${pad(endHour)}:00:00`;

        const slotId = await insert("time_slots", {
          employee_id: emp,
          start_time: start,
          end_time: end,
        });

        employeeSlots.push({ id: slotId, start, end });
      }
      employeeTimeSlotsMap.set(emp, employeeSlots);

      const nurse = await insert("nurses", {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        password: passwordHash,
      });
      nurseIds.push(nurse);

      const visitor = await insert("visitors", {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        contact_number: faker.helpers.replaceSymbols("09#########"),
        address: faker.location.streetAddress(),
        password: passwordHash,
      });
      visitorIds.push(visitor);

      const commentId = await insert("comments", {
        content: faker.lorem.sentence(),
      });

      // Generate a visit date
      const visitDate = faker.date
        .recent({ days: 14 })
        .toISOString()
        .slice(0, 10);

      // Get a reusable, unused time slot for this employee on this day
      const employeeSlotsToday = employeeTimeSlotsMap.get(emp);
      let selectedSlot;
      for (const slot of employeeSlotsToday) {
        const slotKey = `${emp}|${visitDate}|${slot.id}`;
        if (!usedSlotsPerDay.has(slotKey)) {
          usedSlotsPerDay.set(slotKey, true);
          selectedSlot = slot;
          break;
        }
      }

      // If no available slot, skip visit to avoid conflict
      if (!selectedSlot) continue;

      const expectedTime = `${selectedSlot.start.slice(0, 5)} - ${selectedSlot.end.slice(0, 5)}`;

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

    console.log(`✅ Seeding ${dryRun ? "previewed" : "complete"}.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
