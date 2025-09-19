import { jsPDF } from 'jspdf';

const DEFAULT_MARGIN = 4;
const LINE_HEIGHT = 4.2;

const formatCurrency = (value, currency = 'MXN') => {
  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(Number(value) || 0);
  } catch (error) {
    return `$${(Number(value) || 0).toFixed(2)}`;
  }
};

const drawDivider = (doc, pageWidth, cursorY, margin = DEFAULT_MARGIN) => {
  doc.setLineWidth(0.2);
  doc.setLineDash([1, 1], 0);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  doc.setLineDash();
  return cursorY + 2.5;
};

const addWrappedText = (doc, text, x, y, maxWidth, options = {}) => {
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line, index) => {
    doc.text(line, x, y + index * (LINE_HEIGHT - 0.6), options);
  });
  return y + (lines.length - 1) * (LINE_HEIGHT - 0.6);
};

export const generateThermalReceiptPdf = (order, { paperWidthMM = 58 } = {}) => {
  if (!order) {
    throw new Error('No se encontró información del pedido para generar el recibo.');
  }

  const doc = new jsPDF({
    unit: 'mm',
    format: [paperWidthMM, 200],
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = DEFAULT_MARGIN;
  let cursorY = margin + 1;
  const contentWidth = pageWidth - margin * 2;
  const currency = order.payment?.currency || 'MXN';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(order.store?.name || 'Recibo', pageWidth / 2, cursorY, { align: 'center' });
  cursorY += LINE_HEIGHT;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  [order.store?.address, order.store?.phone, order.store?.rfc]
    .filter(Boolean)
    .forEach((line) => {
      cursorY = addWrappedText(doc, line, pageWidth / 2, cursorY, contentWidth, { align: 'center' });
      cursorY += LINE_HEIGHT - 1.2;
    });

  cursorY += 0.5;
  cursorY = drawDivider(doc, pageWidth, cursorY, margin);
  cursorY += 1;

  const createdAtDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const formattedDate = `${createdAtDate.toLocaleDateString()} ${createdAtDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  doc.text(`Folio: ${order.id || 'N/A'}`, margin, cursorY);
  cursorY += LINE_HEIGHT - 1;
  cursorY = addWrappedText(doc, `Fecha: ${formattedDate}`, margin, cursorY, contentWidth);
  cursorY += LINE_HEIGHT - 1;
  doc.text(`Pago: ${order.payment?.method || 'N/A'}`, margin, cursorY);
  cursorY += LINE_HEIGHT;

  cursorY = drawDivider(doc, pageWidth, cursorY, margin);
  cursorY += 1;

  order.items.forEach((item) => {
    const addonsTotal = (item.addons || []).reduce((sum, addon) => sum + (Number(addon.price) || 0), 0);
    const lineTotal = item.unitPrice * item.qty + addonsTotal;
    const lineText = `${item.qty} x ${item.name}`;
    const lineMaxWidth = contentWidth - 16;
    const startY = cursorY;

    const lines = doc.splitTextToSize(lineText, lineMaxWidth);
    lines.forEach((line, index) => {
      const yPos = startY + index * (LINE_HEIGHT - 0.6);
      doc.text(line, margin, yPos);
      if (index === 0) {
        doc.text(formatCurrency(lineTotal, currency), pageWidth - margin, yPos, { align: 'right' });
      }
    });

    cursorY = startY + (lines.length - 1) * (LINE_HEIGHT - 0.6) + LINE_HEIGHT - 0.6;

    if (item.addons && item.addons.length > 0) {
      doc.setFontSize(8);
      item.addons.forEach((addon) => {
        const addonLines = doc.splitTextToSize(addon.name, lineMaxWidth);
        addonLines.forEach((addonLine, index) => {
          const addonY = cursorY + index * (LINE_HEIGHT - 1);
          doc.text(addonLine, margin + 3, addonY);
          if (index === 0) {
            doc.text(formatCurrency(addon.price || 0, currency), pageWidth - margin, addonY, { align: 'right' });
          }
        });
        cursorY += addonLines.length * (LINE_HEIGHT - 1);
      });
      doc.setFontSize(9);
    }

    if (item.notes) {
      doc.setFontSize(8);
      cursorY = addWrappedText(doc, `Nota: ${item.notes}`, margin + 3, cursorY, lineMaxWidth);
      cursorY += LINE_HEIGHT - 1.5;
      doc.setFontSize(9);
    }

    cursorY += 0.5;
  });

  cursorY = drawDivider(doc, pageWidth, cursorY, margin);
  cursorY += LINE_HEIGHT - 1;

  const addSummaryLine = (label, value, emphasis = false) => {
    if (value == null) return;
    if (emphasis) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
    }
    doc.text(label, margin, cursorY);
    doc.text(formatCurrency(value, currency), pageWidth - margin, cursorY, { align: 'right' });
    cursorY += emphasis ? LINE_HEIGHT + 0.5 : LINE_HEIGHT - 0.8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
  };

  addSummaryLine('Subtotal', order.subtotal);
  if (order.discount) {
    addSummaryLine('Descuento', -Math.abs(order.discount));
  }
  if (order.taxes) {
    addSummaryLine('Impuestos', order.taxes);
  }
  addSummaryLine('TOTAL', order.total, true);

  if (order.payment?.method === 'EFECTIVO' || order.payment?.method === 'DOLARES') {
    if (order.payment?.cashGiven != null) {
      addSummaryLine('Recibido', order.payment.cashGiven);
    }
    if (order.payment?.change != null) {
      addSummaryLine('Cambio', order.payment.change);
    }
  }

  cursorY = drawDivider(doc, pageWidth, cursorY, margin);
  cursorY += LINE_HEIGHT - 1;

  if (order.customerName) {
    cursorY = addWrappedText(doc, `Cliente: ${order.customerName}`, margin, cursorY, contentWidth);
    cursorY += LINE_HEIGHT - 1;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  cursorY = addWrappedText(doc, '¡Gracias por su compra!', pageWidth / 2, cursorY, contentWidth, { align: 'center' });
  cursorY += LINE_HEIGHT;

  const finalHeight = cursorY + margin;
  if (doc.internal.pageSize.getHeight() !== finalHeight) {
    doc.internal.pageSize.setHeight(finalHeight);
  }

  const blob = doc.output('blob');
  const objectUrl = URL.createObjectURL(blob);

  return { blob, url: objectUrl, doc };
};

export const THERMAL_PAPER_WIDTHS = [58, 80];
