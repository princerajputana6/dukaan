// Builds a thermal-printer-friendly (58mm) HTML receipt and prints it.
// Works with any printer set as default in the browser's print dialog,
// including USB/Bluetooth thermal bill printers.

function money(n) {
  return Number(n || 0).toFixed(2);
}

// Compute GST breakdown (CGST + SGST) from the sale total.
export function computeGst(total, gstRate, pricesIncludeTax = true) {
  const rate = Number(gstRate) || 0;
  if (rate <= 0) return null;
  let taxable, gst;
  if (pricesIncludeTax) {
    taxable = total / (1 + rate / 100);
    gst = total - taxable;
  } else {
    taxable = total;
    gst = total * (rate / 100);
  }
  return {
    rate,
    half: rate / 2,
    taxable: taxable,
    cgst: gst / 2,
    sgst: gst / 2,
    total: gst,
  };
}

export function buildReceiptHTML(sale, business, store) {
  const b = business || {};
  const s = store || {};
  const shopName = s.name || b.name || "Receipt";
  const gst = computeGst(sale.total, b.gstRate, b.pricesIncludeTax);

  const line = (left, right) =>
    `<div class="row"><span>${left}</span><span>${right}</span></div>`;

  const itemsHtml = sale.items
    .map(
      (it) => `
      <div class="item">
        <div class="row"><span class="name">${escapeHtml(it.name)}</span></div>
        <div class="row sub"><span>${it.quantity} x ${money(it.price)}</span><span>${money(
        it.lineTotal
      )}</span></div>
      </div>`
    )
    .join("");

  const gstHtml = gst
    ? `
      <div class="divider"></div>
      <div class="center small">ABOVE PRICES INCLUDE TAXES</div>
      ${line(`CGST @ ${gst.half}%`, money(gst.cgst))}
      ${line(`SGST @ ${gst.half}%`, money(gst.sgst))}
      ${line("<b>TOTAL GST</b>", `<b>${money(gst.total)}</b>`)}`
    : "";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(shopName)} — ${escapeHtml(sale.invoiceNo)}</title>
<style>
  @page { size: 58mm auto; margin: 0; }
  * { box-sizing: border-box; }
  body {
    width: 58mm;
    margin: 0 auto;
    padding: 6px 8px;
    font-family: "Courier New", monospace;
    font-size: 11px;
    color: #000;
    line-height: 1.35;
  }
  .center { text-align: center; }
  .small { font-size: 10px; }
  .big { font-size: 14px; font-weight: bold; }
  .row { display: flex; justify-content: space-between; gap: 6px; }
  .row .name { font-weight: bold; }
  .sub { color: #000; }
  .divider { border-top: 1px dashed #000; margin: 6px 0; }
  .item { margin-bottom: 2px; }
  .muted { font-size: 10px; }
  h1 { font-size: 15px; margin: 0; text-align: center; letter-spacing: 1px; }
</style>
</head>
<body>
  <h1>${escapeHtml(shopName)}</h1>
  ${s.location || b.address ? `<div class="center small">${escapeHtml(s.location || b.address)}</div>` : ""}
  ${s.phone || b.phone ? `<div class="center small">Call: ${escapeHtml(s.phone || b.phone)}</div>` : ""}
  ${b.gstin ? `<div class="center small">GSTIN: ${escapeHtml(b.gstin)}</div>` : ""}
  ${b.fssai ? `<div class="center small">FSSAI: ${escapeHtml(b.fssai)}</div>` : ""}
  <div class="divider"></div>
  <div class="row small"><span>${escapeHtml(sale.invoiceNo)}</span><span>${new Date(
    sale.createdAt || Date.now()
  ).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span></div>
  <div class="row small"><span>Cashier: ${escapeHtml(sale.cashierName || "-")}</span><span>${escapeHtml(
    (sale.paymentMethod || "cash").toUpperCase()
  )}</span></div>
  <div class="divider"></div>
  ${itemsHtml}
  <div class="divider"></div>
  ${line("Subtotal", money(sale.subTotal))}
  ${sale.discount ? line("Discount", "-" + money(sale.discount)) : ""}
  ${sale.tax ? line("Tax", "+" + money(sale.tax)) : ""}
  <div class="row big"><span>TOTAL</span><span>₹${money(sale.total)}</span></div>
  ${gstHtml}
  <div class="divider"></div>
  <div class="center small">${escapeHtml(b.receiptFooter || "Thank you! Visit again.")}</div>
  <div class="center muted">Powered by Dukaan</div>
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

export function printReceipt(sale, business, store) {
  const html = buildReceiptHTML(sale, business, store);
  const win = window.open("", "_blank", "width=380,height=600");
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  // Give the browser a moment to lay out before printing.
  setTimeout(() => {
    win.print();
  }, 300);
  return true;
}

// Build a thermal-width PDF of the receipt. Core PDF fonts lack the ₹ glyph,
// so amounts use "Rs" in the PDF.
export async function buildReceiptPdf(sale, business, store) {
  const { jsPDF } = await import("jspdf");
  const b = business || {};
  const s = store || {};
  const shopName = s.name || b.name || "Receipt";
  const gst = computeGst(sale.total, b.gstRate, b.pricesIncludeTax);
  const rs = (n) => "Rs " + money(n);

  const headerExtras = [
    s.location || b.address,
    (s.phone || b.phone) && `Call: ${s.phone || b.phone}`,
    b.gstin && `GSTIN: ${b.gstin}`,
    b.fssai && `FSSAI: ${b.fssai}`,
  ].filter(Boolean);

  const lineH = 4.3;
  const rowCount =
    1 +
    headerExtras.length +
    2 +
    sale.items.length * 2 +
    3 +
    (sale.discount ? 1 : 0) +
    (sale.tax ? 1 : 0) +
    (gst ? 4 : 0) +
    2;
  const height = Math.max(90, 16 + rowCount * lineH);

  const doc = new jsPDF({ unit: "mm", format: [58, height] });
  const L = 3;
  const R = 55;
  const C = 29;
  let y = 7;

  const center = (txt, size = 8, bold = false) => {
    doc.setFontSize(size);
    doc.setFont("courier", bold ? "bold" : "normal");
    doc.text(String(txt), C, y, { align: "center" });
    y += lineH;
  };
  const row = (l, r, size = 8, bold = false) => {
    doc.setFontSize(size);
    doc.setFont("courier", bold ? "bold" : "normal");
    doc.text(String(l), L, y);
    doc.text(String(r), R, y, { align: "right" });
    y += lineH;
  };
  const divider = () => {
    doc.setLineDashPattern([0.6, 0.6], 0);
    doc.setLineWidth(0.2);
    doc.line(L, y - 2.5, R, y - 2.5);
    y += 1;
  };

  center(shopName, 11, true);
  headerExtras.forEach((t) => center(t, 7));
  divider();
  row(
    sale.invoiceNo,
    new Date(sale.createdAt || Date.now()).toLocaleDateString("en-IN"),
    7
  );
  row(`Cashier: ${sale.cashierName || "-"}`, (sale.paymentMethod || "cash").toUpperCase(), 7);
  divider();
  sale.items.forEach((it) => {
    doc.setFontSize(8);
    doc.setFont("courier", "bold");
    doc.text(String(it.name).slice(0, 28), L, y);
    y += lineH - 0.6;
    row(`${it.quantity} x ${money(it.price)}`, money(it.lineTotal), 7);
  });
  divider();
  row("Subtotal", rs(sale.subTotal), 8);
  if (sale.discount) row("Discount", "-" + rs(sale.discount), 8);
  if (sale.tax) row("Tax", "+" + rs(sale.tax), 8);
  row("TOTAL", rs(sale.total), 10, true);
  if (gst) {
    divider();
    center("Above prices include taxes", 6.5);
    row(`CGST @ ${gst.half}%`, money(gst.cgst), 7);
    row(`SGST @ ${gst.half}%`, money(gst.sgst), 7);
    row("TOTAL GST", money(gst.total), 7, true);
  }
  divider();
  center(b.receiptFooter || "Thank you! Visit again.", 7);
  center("Powered by Dukaan", 6);

  return doc;
}

export async function downloadReceiptPdf(sale, business, store) {
  const doc = await buildReceiptPdf(sale, business, store);
  doc.save(`${sale.invoiceNo || "receipt"}.pdf`);
}

// Share the receipt PDF (e.g. to WhatsApp) via the Web Share API when the
// device supports sharing files; otherwise fall back to downloading it.
export async function shareReceiptPdf(sale, business, store) {
  const doc = await buildReceiptPdf(sale, business, store);
  const blob = doc.output("blob");
  const file = new File([blob], `${sale.invoiceNo || "receipt"}.pdf`, {
    type: "application/pdf",
  });
  const shopName = (store && store.name) || (business && business.name) || "Receipt";
  if (
    typeof navigator !== "undefined" &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: `${shopName} — ${sale.invoiceNo}`,
        text: `Receipt from ${shopName}`,
      });
      return "shared";
    } catch (e) {
      if (e?.name === "AbortError") return "cancelled";
    }
  }
  doc.save(`${sale.invoiceNo || "receipt"}.pdf`);
  return "downloaded";
}
