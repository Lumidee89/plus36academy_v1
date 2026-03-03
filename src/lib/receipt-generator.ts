import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ReceiptData {
  paymentId: string
  amount: number
  currency: string
  date: Date
  provider: string
  providerRef?: string
  courseTitle: string
  tutorName: string
  studentName: string
  studentEmail: string
}

export async function generateReceiptPDF(data: ReceiptData): Promise<Buffer> {
  const doc = new jsPDF()
  
  // Use autoTable
  autoTable(doc, {
    startY: 110,
    head: [['Description', 'Details']],
    body: [
      ['Course', data.courseTitle],
      ['Instructor', data.tutorName],
      ['Payment Method', data.provider.toUpperCase()],
      ['Transaction Reference', data.providerRef || 'N/A'],
      ['Amount', `${data.currency} ${data.amount.toLocaleString()}`],
      ['Status', 'COMPLETED'],
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { cellWidth: 100 },
    },
  })

  // Set document properties
  doc.setProperties({
    title: `Receipt-${data.paymentId.slice(0, 8)}`,
    subject: 'Payment Receipt',
    author: 'Plus36 Academy',
    creator: 'Plus36 Academy'
  })

  // Add logo and header
  doc.setFontSize(24)
  doc.setTextColor(34, 197, 94) // Brand green
  doc.text('Plus36 Academy', 105, 20, { align: 'center' })
  
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text('Payment Receipt', 105, 35, { align: 'center' })

  // Add receipt details
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Receipt No: ${data.paymentId}`, 20, 50)
  doc.text(`Date: ${data.date.toLocaleDateString()}`, 20, 57)
  doc.text(`Time: ${data.date.toLocaleTimeString()}`, 20, 64)

  // Add customer details
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text('Customer Details:', 20, 80)
  
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Name: ${data.studentName}`, 20, 90)
  doc.text(`Email: ${data.studentEmail}`, 20, 97)

  // Add total
  const finalY = (doc as any).lastAutoTable?.finalY + 10 || 200
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text('Total Paid:', 130, finalY)
  doc.setFontSize(14)
  doc.setTextColor(34, 197, 94)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.currency} ${data.amount.toLocaleString()}`, 170, finalY)

  // Add footer
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('Thank you for choosing Plus36 Academy!', 105, 270, { align: 'center' })
  doc.text('This is a computer-generated receipt. No signature required.', 105, 277, { align: 'center' })

  // Return as buffer
  return Buffer.from(doc.output('arraybuffer'))
}