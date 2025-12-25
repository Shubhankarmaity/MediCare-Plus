const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'my-app', '..', 'test.tldr');

const createId = (prefix) => `${prefix}:${Math.random().toString(36).substr(2, 9)}`;

const shapes = [];
const records = [];

// Helper to create a shape
function createBox(id, x, y, text, color = 'black') {
    return {
        id: id,
        typeName: 'shape',
        x: x,
        y: y,
        rotation: 0,
        isLocked: false,
        opacity: 1,
        meta: {},
        type: 'geo',
        props: {
            w: 200,
            h: 60,
            geo: 'rectangle',
            color: color,
            fill: 'none',
            dash: 'draw',
            size: 'm',
            font: 'draw',
            align: 'middle',
            verticalAlign: 'middle',
            richText: {
                type: 'doc',
                content: [{
                    type: 'paragraph',
                    content: [{ type: 'text', text: text }]
                }]
            }
        },
        parentId: 'page:page',
        index: 'a' + Math.random().toString(36).substr(2, 5),
    };
}

function createArrow(fromId, toId, text = '') {
    return {
        id: createId('shape'),
        typeName: 'shape',
        x: 0,
        y: 0,
        rotation: 0,
        isLocked: false,
        opacity: 1,
        meta: {},
        type: 'arrow',
        props: {
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 }, // Relative, but binding handles connection
            bend: 0,
            arrowheadStart: 'none',
            arrowheadEnd: 'arrow',
            color: 'black',
            labelColor: 'black',
            dash: 'draw',
            fill: 'none',
            size: 'm',
            text: text,
            font: 'draw',
            richText: {
                type: 'doc',
                content: text ? [{
                    type: 'paragraph',
                    content: [{ type: 'text', text: text }]
                }] : []
            }
        },
        parentId: 'page:page',
        index: 'a' + Math.random().toString(36).substr(2, 5),
    };
}

function createBinding(fromId, toId) {
    return {
        id: createId('binding'),
        typeName: 'binding',
        type: 'arrow',
        fromId: fromId,
        toId: toId,
        props: {
            isPrecise: false,
            isExact: false,
            normalizedAnchor: { x: 0.5, y: 0.5 },
            terminal: 'end' // 'start' or 'end'
        },
        meta: {}
    };
}

// Nodes
const startId = createId('shape');
const patientRegId = createId('shape');
const doctorRegId = createId('shape');
const adminId = createId('shape');
const approveDocId = createId('shape');
const patientLoginId = createId('shape');
const doctorLoginId = createId('shape');
const patientDashId = createId('shape');
const doctorDashId = createId('shape');
const bookAptId = createId('shape');
const viewAptsId = createId('shape');
const submitReportId = createId('shape');
const viewReportId = createId('shape');
const requestAmbId = createId('shape');
const driverId = createId('shape');
const acceptAmbId = createId('shape');

// Layout
let y = 0;
// Column 1: Patient
shapes.push(createBox(patientRegId, 100, 100, 'Patient Registration', 'blue'));
shapes.push(createBox(patientLoginId, 100, 200, 'Patient Login', 'blue'));
shapes.push(createBox(patientDashId, 100, 300, 'Patient Dashboard', 'blue'));
shapes.push(createBox(bookAptId, 100, 450, 'Book Appointment', 'blue'));
shapes.push(createBox(requestAmbId, 100, 600, 'Request Ambulance', 'red'));
shapes.push(createBox(viewReportId, 100, 750, 'View Medical Reports', 'green'));

// Column 2: Admin
shapes.push(createBox(adminId, 400, 100, 'Admin Dashboard', 'black'));
shapes.push(createBox(approveDocId, 400, 200, 'Approve Doctor', 'black'));

// Column 3: Doctor
shapes.push(createBox(doctorRegId, 700, 100, 'Doctor Registration', 'violet'));
shapes.push(createBox(doctorLoginId, 700, 200, 'Doctor Login', 'violet'));
shapes.push(createBox(doctorDashId, 700, 300, 'Doctor Dashboard', 'violet'));
shapes.push(createBox(viewAptsId, 700, 450, 'View Appointments', 'violet'));
shapes.push(createBox(submitReportId, 700, 600, 'Submit Report', 'green'));

// Column 4: Driver
shapes.push(createBox(driverId, 1000, 300, 'Ambulance Driver', 'red'));
shapes.push(createBox(acceptAmbId, 1000, 600, 'Accept Request', 'red'));

// Arrows & Bindings
const connections = [
    { from: patientRegId, to: patientLoginId },
    { from: patientLoginId, to: patientDashId },
    { from: patientDashId, to: bookAptId },
    { from: patientDashId, to: requestAmbId },

    // Admin Flow
    { from: doctorRegId, to: approveDocId, label: 'Needs Approval' },
    { from: adminId, to: approveDocId },
    { from: approveDocId, to: doctorLoginId, label: 'If Approved' },

    // Doctor Flow
    { from: doctorLoginId, to: doctorDashId },
    { from: doctorDashId, to: viewAptsId },
    { from: viewAptsId, to: submitReportId },

    // Interactions
    { from: bookAptId, to: viewAptsId, label: 'Appointment' },
    { from: submitReportId, to: viewReportId, label: 'Data Flow' },
    { from: patientDashId, to: viewReportId },

    // Ambulance
    { from: requestAmbId, to: acceptAmbId, label: 'Socket.io' },
    { from: driverId, to: acceptAmbId },
];

connections.forEach(conn => {
    const arrow = createArrow(conn.from, conn.to, conn.label);
    records.push(arrow);

    // Bindings
    const startBinding = createBinding(conn.from, arrow.id); // Oops, bindings connect shape TO arrow? No. connect arrow TO shape.
    // Tldraw bindings: { type: 'arrow', fromId: arrowId, toId: shapeId, props: { terminal: 'start' } }

    records.push({
        id: createId('binding'),
        typeName: 'binding',
        type: 'arrow',
        fromId: arrow.id,
        toId: conn.from,
        props: { isPrecise: false, isExact: false, normalizedAnchor: { x: 0.5, y: 0.5 }, terminal: 'start' },
        meta: {}
    });

    records.push({
        id: createId('binding'),
        typeName: 'binding',
        type: 'arrow',
        fromId: arrow.id,
        toId: conn.to,
        props: { isPrecise: false, isExact: false, normalizedAnchor: { x: 0.5, y: 0.5 }, terminal: 'end' },
        meta: {}
    });
});

// Combine
const finalRecords = [
    ...shapes,
    ...records,
    {
        id: 'document:document',
        typeName: 'document',
        gridSize: 10,
        meta: {},
        name: ''
    },
    {
        id: 'page:page',
        typeName: 'page',
        name: 'Project Flow',
        index: 'a1',
        meta: {}
    }
];

const tldrawContent = {
    tldrawFileFormatVersion: 1,
    schema: {
        schemaVersion: 2,
        sequences: {
            "com.tldraw.store": 5,
            "com.tldraw.asset": 1,
            "com.tldraw.camera": 1,
            "com.tldraw.document": 2,
            "com.tldraw.instance": 25,
            "com.tldraw.instance_page_state": 5,
            "com.tldraw.page": 1,
            "com.tldraw.instance_presence": 6,
            "com.tldraw.pointer": 1,
            "com.tldraw.shape": 4,
            "com.tldraw.asset.bookmark": 2,
            "com.tldraw.asset.image": 5,
            "com.tldraw.asset.video": 5,
            "com.tldraw.shape.group": 0,
            "com.tldraw.shape.text": 3,
            "com.tldraw.shape.bookmark": 2,
            "com.tldraw.shape.draw": 2,
            "com.tldraw.shape.geo": 10,
            "com.tldraw.shape.note": 9,
            "com.tldraw.shape.line": 5,
            "com.tldraw.shape.frame": 1,
            "com.tldraw.shape.arrow": 7,
            "com.tldraw.shape.highlight": 1,
            "com.tldraw.shape.embed": 4,
            "com.tldraw.shape.image": 5,
            "com.tldraw.shape.video": 4,
            "com.tldraw.binding.arrow": 1
        }
    },
    records: finalRecords
};

fs.writeFileSync(filePath, JSON.stringify(tldrawContent, null, '\t'));
console.log('Flowchart generated at:', filePath);
