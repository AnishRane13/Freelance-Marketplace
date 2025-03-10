// src/utils/pdfGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function generateAgreementPDF(job, quote, user, company, terms) {
  return new Promise((resolve, reject) => {
    try {
      // Create a document
      const doc = new PDFDocument({ margin: 50 });
      
      // Create a temporary file path
      const tempFilePath = path.join(__dirname, `../temp/${uuidv4()}.pdf`);
      const tempDir = path.dirname(tempFilePath);
      
      // Ensure temp directory exists
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Pipe its output to a file
      const stream = fs.createWriteStream(tempFilePath);
      doc.pipe(stream);
      
      // Add content to the PDF
      
      // Header
      doc.fontSize(20).text('JOB AGREEMENT DOCUMENT', { align: 'center' });
      doc.moveDown();
      
      // Company Info
      doc.fontSize(14).text('COMPANY DETAILS', { underline: true });
      doc.fontSize(12);
      doc.text(`Company: ${company.name}`);
      doc.moveDown(0.5);
      
      // Freelancer Info
      doc.fontSize(14).text('FREELANCER DETAILS', { underline: true });
      doc.fontSize(12);
      doc.text(`Name: ${user.name}`);
      doc.text(`Email: ${user.email}`);
      doc.moveDown(0.5);
      
      // Job Details
      doc.fontSize(14).text('JOB DETAILS', { underline: true });
      doc.fontSize(12);
      doc.text(`Job Title: ${job.title}`);
      doc.text(`Description: ${job.description}`);
      doc.text(`Price: ${quote.quote_price} rupees`);
      doc.text(`Deadline: ${new Date(job.deadline).toLocaleDateString()}`);
      doc.moveDown();
      
      // Agreement Terms
      doc.fontSize(14).text('TERMS AND CONDITIONS', { underline: true });
      doc.fontSize(12);
      doc.text(terms);
      doc.moveDown();
      
      // Signature areas
      doc.fontSize(12);
      doc.text('Company Representative Signature:', 50, 650);
      doc.moveTo(50, 670).lineTo(250, 670).stroke();
      doc.text('Freelancer Signature:', 300, 650);
      doc.moveTo(300, 670).lineTo(500, 670).stroke();
      
      // Date
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 700);
      
      // Footer
      doc.fontSize(10).text('This is a legally binding agreement between both parties', 50, 740, { align: 'center' });
      
      // Finalize the PDF
      doc.end();
      
      // When the stream is finished, upload to S3
      stream.on('finish', async () => {
        const fileContent = fs.readFileSync(tempFilePath);
        
        const params = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: `agreements/${job.job_id}_${user.user_id}.pdf`,
          Body: fileContent,
          ContentType: 'application/pdf',
          ACL: 'public-read'
        };
        
        // Upload to S3
        const uploadResult = await s3.upload(params).promise();
        
        // Delete the temp file
        fs.unlinkSync(tempFilePath);
        
        // Resolve with the S3 URL
        resolve(uploadResult.Location);
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateAgreementPDF
};