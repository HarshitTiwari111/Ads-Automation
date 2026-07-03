const Report = require('../models/Report');
const Performance = require('../models/Performance');
const Account = require('../models/Account');
const PDFDocument = require('pdfkit');

exports.generateReport = async (req, res, next) => {
  try {
    const { accountId, reportType, dateFrom, dateTo } = req.body;

    const account = await Account.findOne({ _id: accountId, createdBy: req.user.id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const performances = await Performance.find({
      account: accountId,
      date: { $gte: new Date(dateFrom), $lte: new Date(dateTo) },
    });

    const metrics = performances.reduce(
      (acc, p) => {
        acc.totalImpressions += p.impressions;
        acc.totalClicks += p.clicks;
        acc.totalSpend += p.spend;
        acc.totalConversions += p.conversions;
        return acc;
      },
      { totalImpressions: 0, totalClicks: 0, totalSpend: 0, avgCtr: 0, avgCpc: 0, totalConversions: 0 }
    );

    if (metrics.totalImpressions > 0) {
      metrics.avgCtr = (metrics.totalClicks / metrics.totalImpressions) * 100;
    }
    if (metrics.totalClicks > 0) {
      metrics.avgCpc = metrics.totalSpend / metrics.totalClicks;
    }

    const report = await Report.create({
      account: accountId,
      reportType: reportType || 'daily',
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      metrics,
      status: 'ready',
      generatedBy: 'manual',
    });

    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

exports.getReportsByAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.accountId, createdBy: req.user.id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    const reports = await Report.find({ account: req.params.accountId }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

exports.getAllReports = async (req, res, next) => {
  try {
    const userAccounts = await Account.find({ createdBy: req.user.id }).select('_id');
    const accountIds = userAccounts.map(a => a._id);
    const reports = await Report.find({ account: { $in: accountIds } })
      .populate('account', 'accountName clientName')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

exports.getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).populate('account');
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    const account = await Account.findOne({ _id: report.account._id, createdBy: req.user.id });
    if (!account) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    next(error);
  }
};

exports.exportCSV = async (req, res, next) => {
  try {
    const userAccounts = await Account.find({ createdBy: req.user.id }).select('_id');
    const accountIds = userAccounts.map(a => a._id);
    const reports = await Report.find({ account: { $in: accountIds } })
      .populate('account', 'accountName clientName')
      .sort({ createdAt: -1 });

    const header = 'Account,Client,Type,Date From,Date To,Impressions,Clicks,Spend,CTR,CPC,Conversions,Status\n';
    const rows = reports.map(r =>
      `"${r.account?.accountName || ''}","${r.account?.clientName || ''}","${r.reportType}","${new Date(r.dateFrom).toLocaleDateString()}","${new Date(r.dateTo).toLocaleDateString()}",${r.metrics.totalImpressions},${r.metrics.totalClicks},${r.metrics.totalSpend.toFixed(2)},${r.metrics.avgCtr.toFixed(2)}%,${r.metrics.avgCpc.toFixed(2)},${r.metrics.totalConversions},"${r.status}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=reports.csv');
    res.send(header + rows);
  } catch (error) {
    next(error);
  }
};

exports.exportPDF = async (req, res, next) => {
  try {
    const userAccounts = await Account.find({ createdBy: req.user.id }).select('_id');
    const accountIds = userAccounts.map(a => a._id);
    const reports = await Report.find({ account: { $in: accountIds } })
      .populate('account', 'accountName clientName')
      .sort({ createdAt: -1 });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reports.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('Performance Reports', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#6b7280').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1.5);

    reports.forEach((r, i) => {
      if (doc.y > 680) doc.addPage();

      doc.fontSize(13).fillColor('#1a1a2e').text(`${i + 1}. ${r.account?.accountName || 'Unknown'}`, { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor('#374151');
      doc.text(`Client: ${r.account?.clientName || '-'}    |    Type: ${r.reportType}    |    Status: ${r.status}`);
      doc.text(`Period: ${new Date(r.dateFrom).toLocaleDateString()} - ${new Date(r.dateTo).toLocaleDateString()}`);
      doc.moveDown(0.3);

      const m = r.metrics;
      doc.text(`Impressions: ${m.totalImpressions.toLocaleString()}    Clicks: ${m.totalClicks.toLocaleString()}    Spend: $${m.totalSpend.toFixed(2)}`);
      doc.text(`CTR: ${m.avgCtr.toFixed(2)}%    CPC: $${m.avgCpc.toFixed(2)}    Conversions: ${m.totalConversions}`);
      doc.moveDown(0.5);
      doc.strokeColor('#e5e7eb').moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.5);
    });

    if (reports.length === 0) {
      doc.fontSize(12).fillColor('#9ca3af').text('No reports available.', { align: 'center' });
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};
