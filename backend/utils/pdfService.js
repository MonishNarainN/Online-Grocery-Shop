const PDFDocument = require('pdfkit');

const generateOrderPdf = (order, dataCallback, endCallback) => {
    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Stream the document data
    doc.on('data', dataCallback);
    doc.on('end', endCallback);

    // --- Header ---
    doc.fontSize(20).font('Helvetica-Bold').text('Friendly Grocer', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Order Invoice', { align: 'center' });
    doc.moveDown();

    // --- Order Details ---
    doc.fontSize(10).font('Helvetica-Bold').text(`Order ID: `, { continued: true }).font('Helvetica').text(order._id);
    doc.font('Helvetica-Bold').text(`Date: `, { continued: true }).font('Helvetica').text(new Date(order.created_at).toLocaleString());
    doc.font('Helvetica-Bold').text(`Order Status: `, { continued: true }).font('Helvetica').text(order.order_status.toUpperCase());
    doc.font('Helvetica-Bold').text(`Payment Status: `, { continued: true }).font('Helvetica').text(order.payment_status.toUpperCase());
    doc.moveDown();

    // --- Customer Details ---
    doc.fontSize(12).font('Helvetica-Bold').text('Shipping Details:');
    doc.fontSize(10).font('Helvetica').text(order.shipping_address);
    doc.moveDown(2);

    // --- Table Header ---
    const tableTop = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Item', 50, tableTop);
    doc.text('Price', 280, tableTop, { width: 90, align: 'right' });
    doc.text('Qty', 370, tableTop, { width: 50, align: 'right' });
    doc.text('Line Total', 420, tableTop, { width: 90, align: 'right' });
    doc.moveTo(50, tableTop + 15).lineTo(510, tableTop + 15).stroke();

    // --- Table Rows ---
    let yPosition = tableTop + 25;
    doc.font('Helvetica');

    order.items.forEach(item => {
        const lineTotal = item.price * item.quantity;

        // Check for page break
        if (yPosition > 700) {
            doc.addPage();
            yPosition = 50;
        }

        doc.text(item.name, 50, yPosition, { width: 230 });
        doc.text(`Rs. ${item.price.toFixed(2)}`, 280, yPosition, { width: 90, align: 'right' });
        doc.text(item.quantity.toString(), 370, yPosition, { width: 50, align: 'right' });
        doc.text(`Rs. ${lineTotal.toFixed(2)}`, 420, yPosition, { width: 90, align: 'right' });

        yPosition += 20;
    });

    // --- Table Footer (Totals) ---
    doc.moveTo(50, yPosition).lineTo(510, yPosition).stroke();
    yPosition += 10;

    doc.font('Helvetica-Bold');
    doc.text('Total Amount:', 280, yPosition, { width: 140, align: 'right' });
    doc.font('Helvetica-Bold').text(`Rs. ${order.total_amount.toFixed(2)}`, 420, yPosition, { width: 90, align: 'right' });

    // --- Footer message ---
    doc.moveDown(4);
    doc.font('Helvetica-Oblique').fontSize(10).text('Thank you for shopping with us!', { align: 'center' });

    // Finalize the PDF
    doc.end();
};

module.exports = { generateOrderPdf };
