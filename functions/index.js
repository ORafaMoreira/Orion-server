const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { PDFDocument, rgb, degrees, StandardFonts } = require("pdf-lib");
const fs = require("fs");

exports.fillPdfForm = onRequest(async (request, response) => {
  try {
    const localFilePath = 'Caminho/Para/Seu/Formulario.pdf'; // Substitua pelo caminho real do seu PDF
    const existingPdfBytes = fs.readFileSync(localFilePath);

    // Informações recebidas por HTTP
    const formData = request.body;

    // Use o pdf-lib para carregar o PDF existente
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Preencha o formulário com as informações recebidas
    const formFields = pdfDoc.getForm().getFields();
    for (const fieldName in formData) {
      const field = formFields.find(f => f.getName() === fieldName);
      if (field) {
        field.setText(formData[fieldName]);
      } else {
        logger.warn(`Campo de formulário '${fieldName}' não encontrado no PDF.`);
      }
    }

    // Salve o PDF modificado
    const modifiedPdfBytes = await pdfDoc.save();

    // Envie o PDF modificado como resposta
    response.setHeader('Content-Type', 'application/pdf');
    response.status(200).send(Buffer.from(modifiedPdfBytes));
  } catch (error) {
    logger.error('Erro ao preencher o formulário PDF:', error);
    response.status(500).send('Erro interno do servidor');
  }
});
