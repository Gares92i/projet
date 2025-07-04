import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { ReportDto } from './dto/report.dto';
import * as sharp from 'sharp';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly tempDir: string;

  constructor(private configService: ConfigService) {
    // Créer un dossier temporaire pour les PDF
    this.tempDir = path.join(os.tmpdir(), 'archihub-pdf');
    fs.ensureDirSync(this.tempDir);
    this.logger.log(`Dossier temporaire pour les PDF: ${this.tempDir}`);
  }

  /**
   * Génère un PDF de rapport de visite
   */
  async generateSiteVisitReport(reportData: ReportDto): Promise<string> {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true, // Important pour pouvoir accéder à toutes les pages
        info: {
          Title: `Compte rendu de visite - ${reportData.reportNumber || 'Sans numéro'}`,
          Author: reportData.architectInfo?.name || 'ArchiHub',
          Subject: `Rapport de visite du projet ${reportData.project?.name || 'Non spécifié'}`,
        },
      });

      // Créer un nom de fichier unique
      const filename = `report-${reportData.reportId || uuidv4()}.pdf`;
      const outputPath = path.join(this.tempDir, filename);
      const stream = fs.createWriteStream(outputPath);

      doc.pipe(stream);

      // Générer le contenu du PDF
      await this.generateReportContent(doc, reportData);

      // Ajouter des pieds de page APRÈS que tout le contenu soit généré
      // Mais AVANT de finaliser le document
      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        this.generateFooter(doc, i + 1, range.count, reportData);
      }

      // Finaliser le PDF
      doc.end();

      // Attendre que le fichier soit écrit
      return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Erreur lors de la génération du PDF: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Génère le contenu du rapport
   */
  private async generateReportContent(doc: any, data: ReportDto): Promise<void> {
    // Styles communs
    const titleFont = 'Helvetica-Bold';
    const regularFont = 'Helvetica';
    const titleSize = 16;
    const subtitleSize = 14;
    const normalSize = 10;
    const smallSize = 8;

    // En-tête du rapport
    await this.generateHeader(doc, data);

    // Informations du projet
    doc.moveDown();
    doc.font(titleFont).fontSize(subtitleSize).text('Informations du projet', { underline: true });
    doc.moveDown(0.5);

    doc.font(regularFont).fontSize(normalSize);
    doc.text(`Projet: ${data.project?.name || 'Non spécifié'}`);
    doc.text(`Emplacement: ${data.project?.location || 'Non spécifié'}`);
    doc.text(`Client: ${data.project?.client || 'Non spécifié'}`);
    doc.text(`Date de visite: ${this.formatDate(data.visitDate)}`);
    doc.text(`Responsable: ${data.inCharge || 'Non spécifié'}`);
    doc.text(`Entrepreneur: ${data.contractor || 'Non spécifié'}`);

    // Résumé et progression
    doc.moveDown();
    doc.font(titleFont).fontSize(subtitleSize).text('Résumé', { underline: true });
    doc.moveDown(0.5);

    // Barre de progression
    const progress =
      data.taskProgress && data.taskProgress.length > 0
        ? this.calculateAverageProgress(data.taskProgress)
        : data.progress || 0;

    doc.font(regularFont).fontSize(normalSize).text(`Progression: ${progress}%`);
    this.drawProgressBar(doc, progress);

    // Participants
    if (data.participants && data.participants.length > 0) {
      await this.generateParticipantsSection(doc, data);
    }

    // Avancement des lots
    if (data.taskProgress && data.taskProgress.length > 0) {
      await this.generateTaskProgressSection(doc, data);
    }

    // Réserves et annotations
    if (data.reserves && data.reserves.length > 0) {
      await this.generateReservesSection(doc, data);
    }

    // Plans avec annotations
    if (data.annotationsByDocument && Object.keys(data.annotationsByDocument).length > 0) {
      await this.generateAnnotatedPlansSection(doc, data);
    }

    // Photos du site
    if (data.photos && data.photos.length > 0) {
      await this.generatePhotosSection(doc, data);
    }

    // Observations
    if (data.observations && data.observations.length > 0) {
      await this.generateObservationsSection(doc, data);
    }

    // Recommandations
    if (data.recommendations && data.recommendations.length > 0) {
      await this.generateRecommendationsSection(doc, data);
    }

    // Informations supplémentaires
    if (data.additionalDetails) {
      doc.addPage();
      doc
        .font(titleFont)
        .fontSize(subtitleSize)
        .text('Informations supplémentaires', { underline: true });
      doc.moveDown(0.5);
      doc.font(regularFont).fontSize(normalSize).text(data.additionalDetails);
    }

    // Documents joints
    if (data.attachments && data.attachments.length > 0) {
      doc.moveDown();
      doc.font(titleFont).fontSize(subtitleSize).text('Documents joints', { underline: true });
      doc.moveDown(0.5);

      data.attachments.forEach((attachment, index) => {
        doc
          .font(regularFont)
          .fontSize(normalSize)
          .text(`Document ${index + 1}: ${attachment.split('/').pop() || attachment}`, {
            link: attachment,
            underline: true,
          });
      });
    }

    // Signatures
    doc.addPage();
    await this.generateSignaturesSection(doc, data);

    // Pied de page sur chaque page
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      this.generateFooter(doc, i + 1, pages.count, data);
    }
  }

  /**
   * Génère l'en-tête du rapport
   */
  private async generateHeader(doc: any, data: ReportDto): Promise<void> {
    const title = 'COMPTE RENDU DE VISITE';
    const architectInfo = data.architectInfo || {
      name: "Cabinet d'Architecture",
      address: '',
      phone: '',
      email: '',
    };

    // Logo et informations de l'architecte
    if (data.project?.imageUrl) {
      try {
        // Tenter de charger l'image du projet
        const logoPath = await this.downloadImage(data.project.imageUrl);
        doc.image(logoPath, 50, 50, { width: 60 });
      } catch (error) {
        this.logger.warn(`Impossible de charger le logo: ${error.message}`);
        // Dessiner un rectangle vide si l'image ne peut pas être chargée
        doc.rect(50, 50, 60, 60).stroke();
      }
    }

    // Informations de l'architecte
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(architectInfo.name || "Cabinet d'Architecture", 120, 50);
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(architectInfo.address || '', 120, doc.y + 5);
    doc.text(architectInfo.phone || '', 120, doc.y + 5);
    doc.text(architectInfo.email || '', 120, doc.y + 5);

    // Titre et informations du rapport
    const pageWidth = doc.page.width;
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(title, pageWidth - 300, 50, { align: 'right' });
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Réf: ${data.reportNumber || 'Non spécifié'}`, pageWidth - 300, doc.y + 5, {
        align: 'right',
      })
      .text(`Date: ${this.formatDate(data.visitDate)}`, { align: 'right' });

    // Ligne de séparation
    doc.moveDown(2);
    doc
      .moveTo(50, doc.y)
      .lineTo(pageWidth - 50, doc.y)
      .stroke();
    doc.moveDown();
  }

  /**
   * Génère la section des participants
   */
  private async generateParticipantsSection(
    doc: any,
    data: ReportDto,
  ): Promise<void> {
    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('Participants', { underline: true });
    doc.moveDown(0.5);

    // Légende des statuts
    doc.fontSize(9).font('Helvetica');
    doc.text('P: Présent   R: Retard   A: Absent   E: Excusé', { align: 'right' });
    doc.moveDown(0.5);

    // Tableau des participants
    const tableHeaders = ['Rôle', 'Contact', 'Email', 'Téléphone', 'Présence'];
    const tableData =
      data.participants?.map((p) => [
        p.role || 'Non défini',
        p.contact || 'Non défini',
        p.email || 'Non défini',
        p.phone || 'Non défini',
        p.presence || 'N/A',
      ]) || [];

    // Créer un tableau
    this.createTable(doc, tableHeaders, tableData);
  }

  /**
   * Génère la section d'avancement des lots
   */
  private async generateTaskProgressSection(
    doc: any,
    data: ReportDto,
  ): Promise<void> {
    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('Avancement des lots', { underline: true });
    doc.moveDown(0.5);

    // Tableau d'avancement
    const tableHeaders = ['N°', 'Lot', 'Progression'];
    const tableData =
      data.taskProgress?.map((task, index) => [
        task.number?.toString() || (index + 1).toString(),
        task.title || 'Non défini',
        `${task.progress || 0}%`,
      ]) || [];

    // Créer un tableau
    this.createTable(doc, tableHeaders, tableData);

    // Dessiner les barres de progression
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10);

    data.taskProgress?.forEach((task, index) => {
      const y = doc.y;
      doc.text(`${task.title || 'Lot ' + (index + 1)}: `, 50, y);
      this.drawProgressBar(doc, task.progress || 0, 200, y + 3, task.color);
      doc.text(`${task.progress || 0}%`, 450, y);
      doc.moveDown(0.7);
    });
  }

  /**
   * Génère la section des réserves
   */
  private async generateReservesSection(doc: any, data: ReportDto): Promise<void> {
    if (!data.reserves || data.reserves.length === 0) return;

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('Réserves et annotations', { underline: true });
    doc.moveDown(0.5);

    // Grouper les réserves par document
    const reservesByDocument = this.groupReservesByDocument(data.reserves);

    for (const [documentName, reserves] of Object.entries(reservesByDocument)) {
      doc.font('Helvetica-Bold').fontSize(12).text(documentName);
      doc.moveDown(0.5);

      // Tableau des réserves
      const tableHeaders = ['N°', 'Localisation', 'Lot', 'Description', 'Date', 'Levée le'];
      const tableData = reserves.map((reserve, index) => [
        (index + 1).toString(),
        reserve.location || 'Non définie',
        reserve.lot || 'Non défini',
        reserve.description || 'Aucune description',
        this.formatDate(reserve.createdAt),
        reserve.resolvedAt ? this.formatDate(reserve.resolvedAt) : 'Non levée',
      ]);

      // Créer un tableau
      this.createTable(doc, tableHeaders, tableData);
      doc.moveDown();

      // Afficher les photos des réserves (max 2 par réserve)
      for (const reserve of reserves) {
        if (reserve.photos && reserve.photos.length > 0) {
          doc.font('Helvetica').fontSize(10).text(`Photos pour réserve ${reserve.id}:`);
          doc.moveDown(0.5);

          const photoRow = [];
          for (let i = 0; i < Math.min(2, reserve.photos.length); i++) {
            try {
              const photoPath = await this.downloadImage(reserve.photos[i]);
              photoRow.push({ src: photoPath, width: 200, height: 150 });
            } catch (error) {
              this.logger.warn(`Impossible de charger la photo: ${error.message}`);
            }
          }

          if (photoRow.length > 0) {
            const startX = 50;
            const startY = doc.y;
            let currentX = startX;
            let maxHeight = 0;

            for (const photo of photoRow) {
              if (currentX + photo.width > doc.page.width - 50) {
                currentX = startX;
                doc.y += maxHeight + 10;
                maxHeight = 0;
              }

              doc.image(photo.src, currentX, doc.y, { width: photo.width });
              maxHeight = Math.max(maxHeight, photo.height);
              currentX += photo.width + 10;
            }

            doc.y += maxHeight + 10;
          }
        }
      }
    }
  }

  /**
   * Génère la section des plans annotés
   */
  private async generateAnnotatedPlansSection(
    doc: any,
    data: ReportDto,
  ): Promise<void> {
    if (!data.annotationsByDocument || Object.keys(data.annotationsByDocument).length === 0) return;

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('Plans avec annotations', { underline: true });
    doc.moveDown(0.5);

    for (const [docId, docInfo] of Object.entries(data.annotationsByDocument)) {
      if (!docInfo.documentUrl && !docInfo.capturedImageUrl) continue;

      try {
        const imageUrl = docInfo.capturedImageUrl || docInfo.documentUrl;
        if (!imageUrl) continue;

        const imagePath = await this.downloadImage(imageUrl);

        // Ajouter une marge pour le titre et la légende
        const availableWidth = doc.page.width - 100;
        const availableHeight = doc.page.height - doc.y - 100;

        // Calculer les dimensions pour maintenir le ratio
        const dimensions = this.calculateImageDimensions(
          availableWidth,
          availableHeight,
          400, // largeur maximale
          300, // hauteur maximale
        );

        // Titre du plan
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .text(docInfo.documentName || `Document ${docId}`);
        doc.moveDown(0.3);

        // Image du plan
        doc.image(imagePath, 50, doc.y, dimensions);
        doc.y += dimensions.height + 10;

        // Légende
        doc
          .font('Helvetica')
          .fontSize(10)
          .text(`${docInfo.annotations?.length || 0} annotation(s)`, 50, doc.y);

        doc.moveDown(1);
      } catch (error) {
        this.logger.warn(`Impossible de charger le plan: ${error.message}`);
        doc
          .font('Helvetica')
          .fontSize(10)
          .text(`Impossible de charger le plan: ${docInfo.documentName || `Document ${docId}`}`, {
            oblique: true,
            stroke: true, // au lieu de color: 'red'
          });
        doc.moveDown(0.5);
      }

      // Si on a traité 2 plans, passer à la page suivante
      if (Object.keys(data.annotationsByDocument).indexOf(docId) % 2 === 1) {
        doc.addPage();
      }
    }
  }

  /**
   * Génère la section des photos
   */
  private async generatePhotosSection(doc: any, data: ReportDto): Promise<void> {
    if (!data.photos || data.photos.length === 0) return;

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('Photos du site', { underline: true });
    doc.moveDown(0.5);

    const photoGrid = [];
    for (let i = 0; i < Math.min(8, data.photos.length); i++) {
      try {
        const photoPath = await this.downloadImage(data.photos[i]);
        photoGrid.push({ src: photoPath, width: 200, height: 150 });
      } catch (error) {
        this.logger.warn(`Impossible de charger la photo: ${error.message}`);
      }
    }

    if (photoGrid.length > 0) {
      const photosPerRow = 2;
      const startX = 50;
      let currentX = startX;
      let currentY = doc.y;
      let rowHeight = 0;

      for (let i = 0; i < photoGrid.length; i++) {
        const photo = photoGrid[i];

        // Si on a atteint la fin de la ligne ou si on est au début
        if (i % photosPerRow === 0) {
          currentX = startX;
          if (i > 0) {
            currentY += rowHeight + 20;
          }
          rowHeight = 0;
        }

        // Si on dépasse la hauteur de la page, créer une nouvelle page
        if (currentY + photo.height > doc.page.height - 100) {
          doc.addPage();
          currentY = 50;
        }

        doc.image(photo.src, currentX, currentY, { width: photo.width });
        doc.fontSize(8).text(`Photo ${i + 1}`, currentX, currentY + photo.height + 5, {
          width: photo.width,
          align: 'center',
        });

        rowHeight = Math.max(rowHeight, photo.height + 20);
        currentX += photo.width + 20;
      }

      doc.y = currentY + rowHeight + 20;

      if (data.photos.length > 8) {
        doc
          .font('Helvetica')
          .fontSize(10)
          .text(`+ ${data.photos.length - 8} autres photos`, { align: 'center' });
      }
    }
  }

  /**
   * Génère la section des observations
   */
  private async generateObservationsSection(
    doc: any,
    data: ReportDto,
  ): Promise<void> {
    if (!data.observations || data.observations.length === 0) return;

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('Observations', { underline: true });
    doc.moveDown(0.5);

    // Tableau des observations
    const tableHeaders = ['N°', 'Observation', 'Description', 'Photo'];
    const tableData = [];

    for (const obs of data.observations) {
      const row = [
        obs.item?.toString() || '',
        obs.observation || 'Non spécifiée',
        obs.description || 'Non spécifiée',
        '',
      ];
      tableData.push(row);
    }

    // Créer un tableau
    this.createTable(doc, tableHeaders, tableData);

    // Ajouter les photos séparément
    doc.moveDown();
    for (const [index, obs] of data.observations.entries()) {
      if (obs.photoUrl) {
        try {
          const photoPath = await this.downloadImage(obs.photoUrl);
          doc.font('Helvetica-Bold').fontSize(10).text(`Photo pour observation ${obs.item}:`);
          doc.image(photoPath, 50, doc.y + 10, { width: 150 });
          doc.moveDown(8);
        } catch (error) {
          this.logger.warn(`Impossible de charger la photo: ${error.message}`);
        }
      }
    }
  }

  /**
   * Génère la section des recommandations
   */
  private async generateRecommendationsSection(
    doc: any,
    data: ReportDto,
  ): Promise<void> {
    if (!data.recommendations || data.recommendations.length === 0) return;

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(14).text('Recommandations', { underline: true });
    doc.moveDown(0.5);

    // Tableau des recommandations
    const tableHeaders = ['N°', 'Observation', 'Action', 'Responsable', 'Statut'];
    const tableData = data.recommendations.map((rec) => [
      rec.item?.toString() || '',
      rec.observation || 'Non spécifiée',
      rec.action || 'Non spécifiée',
      rec.responsible || 'Non spécifié',
      this.getStatusText(rec.status),
    ]);

    // Créer un tableau
    this.createTable(doc, tableHeaders, tableData);

    // Ajouter les photos séparément
    doc.moveDown();
    for (const [index, rec] of data.recommendations.entries()) {
      if (rec.photoUrl) {
        try {
          const photoPath = await this.downloadImage(rec.photoUrl);
          doc.font('Helvetica-Bold').fontSize(10).text(`Photo pour recommandation ${rec.item}:`);
          doc.image(photoPath, 50, doc.y + 10, { width: 150 });
          doc.moveDown(8);
        } catch (error) {
          this.logger.warn(`Impossible de charger la photo: ${error.message}`);
        }
      }
    }
  }

  /**
   * Génère la section des signatures
   */
  private async generateSignaturesSection(doc: any, data: ReportDto): Promise<void> {
    doc.font('Helvetica-Bold').fontSize(14).text('Signatures', { underline: true });
    doc.moveDown(0.5);

    const columnWidth = (doc.page.width - 100) / 3;
    const signatureHeight = 100;

    // Première colonne: Architecte
    doc.font('Helvetica-Bold').fontSize(12).text('Architecte', 50, doc.y);
    doc.rect(50, doc.y + 10, columnWidth - 10, signatureHeight).stroke();
    doc
      .font('Helvetica')
      .fontSize(10)
      .text(
        data.architectInfo?.name || "Cabinet d'Architecture",
        50,
        doc.y + signatureHeight + 20,
        { width: columnWidth - 10, align: 'center' },
      );

    // Deuxième colonne: Maître d'ouvrage
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .text("Maître d'ouvrage", 50 + columnWidth, doc.y - signatureHeight - 30);
    doc
      .rect(50 + columnWidth, doc.y - signatureHeight - 20, columnWidth - 10, signatureHeight)
      .stroke();
    doc
      .font('Helvetica')
      .fontSize(10)
      .text(data.project?.client || 'Client', 50 + columnWidth, doc.y, {
        width: columnWidth - 10,
        align: 'center',
      });

    // Troisième colonne: Entreprise
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('Entreprise', 50 + 2 * columnWidth, doc.y - signatureHeight - 30);
    doc
      .rect(50 + 2 * columnWidth, doc.y - signatureHeight - 20, columnWidth - 10, signatureHeight)
      .stroke();
    doc
      .font('Helvetica')
      .fontSize(10)
      .text(data.contractor || 'Entreprise', 50 + 2 * columnWidth, doc.y, {
        width: columnWidth - 10,
        align: 'center',
      });
  }

  /**
   * Génère le pied de page
   */
  private generateFooter(
    doc: any,
    pageNumber: number,
    totalPages: number,
    data: ReportDto,
  ): void {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Ligne de séparation
    doc
      .moveTo(50, pageHeight - 50)
      .lineTo(pageWidth - 50, pageHeight - 50)
      .stroke();

    // Numéro de page et date d'impression
    doc
      .font('Helvetica')
      .fontSize(8)
      .text(`Page ${pageNumber} sur ${totalPages}`, 50, pageHeight - 40)
      .text(
        `Imprimé le ${this.formatDate(new Date().toISOString())}`,
        pageWidth - 150,
        pageHeight - 40,
      );

    // Référence du rapport
    doc.text(
      `Rapport: ${data.reportNumber || 'Sans référence'} - Projet: ${data.project?.name || 'Non spécifié'}`,
      50,
      pageHeight - 30,
      { width: pageWidth - 100 },
    );
  }

  /**
   * Dessine une barre de progression
   */
  private drawProgressBar(
    doc: any,
    progress: number,
    x: number = 50,
    y: number = doc.y + 5,
    color: string = '#4CAF50',
  ): void {
    const width = 300;
    const height = 10;
    const borderRadius = 5;

    // Fond gris
    doc.roundedRect(x, y, width, height, borderRadius).fillAndStroke('#EEEEEE', '#CCCCCC');

    // Barre de progression
    if (progress > 0) {
      const progressWidth = (Math.max(0, Math.min(100, progress)) * width) / 100;
      doc.roundedRect(x, y, progressWidth, height, borderRadius).fill(color);
    }

    // Label
    doc
      .fillColor('black')
      .text(`${Math.round(progress)}%`, x + width + 10, y - 2, { width: 40, align: 'left' });

    doc.moveDown(1.5);
  }

  /**
   * Crée un tableau simple
   */
  private createTable(doc: any, headers: string[], data: string[][]): void {
    const rowHeight = 20;
    const colWidths: number[] = [];
    const tableWidth = doc.page.width - 100;

    // Calculer la largeur des colonnes
    if (headers.length === 0) return;

    if (headers.length <= 3) {
      // Répartition égale pour 2 ou 3 colonnes
      headers.forEach(() => colWidths.push(tableWidth / headers.length));
    } else {
      // Pour plus de colonnes, première colonne plus petite, puis répartition égale
      colWidths.push(40); // Première colonne (généralement numéro)
      const remainingWidth = tableWidth - 40;
      const remainingCols = headers.length - 1;
      for (let i = 0; i < remainingCols; i++) {
        colWidths.push(remainingWidth / remainingCols);
      }
    }

    // Dessiner l'en-tête
    let currentX = 50;
    let currentY = doc.y;

    doc.rect(currentX, currentY, tableWidth, rowHeight).fill('#EEEEEE').stroke();

    headers.forEach((header, index) => {
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('black')
        .text(header, currentX + 5, currentY + 5, { width: colWidths[index] - 10, align: 'left' });
      currentX += colWidths[index];
    });

    currentY += rowHeight;

    // Dessiner les données
    data.forEach((row, rowIndex) => {
      // Vérifier si on a besoin d'une nouvelle page
      if (currentY + rowHeight > doc.page.height - 70) {
        doc.addPage();
        currentY = 50;
      }

      currentX = 50;
      doc.rect(currentX, currentY, tableWidth, rowHeight).stroke();

      row.forEach((cell, colIndex) => {
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor('black')
          .text(cell, currentX + 5, currentY + 5, {
            width: colWidths[colIndex] - 10,
            align: 'left',
          });
        currentX += colWidths[colIndex];
      });

      currentY += rowHeight;
    });

    doc.y = currentY + 10;
  }

  /**
   * Télécharge une image depuis une URL et la convertit en un chemin de fichier local
   */
  private async downloadImage(url: string): Promise<string> {
    if (!url || url.startsWith('data:')) {
      throw new Error('URL invalide');
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const imageName = `${uuidv4()}.jpg`;
      const imagePath = path.join(this.tempDir, imageName);

      // Convertir et redimensionner l'image avec sharp
      await sharp(Buffer.from(buffer)).resize(800, 600, { fit: 'inside' }).toFile(imagePath);

      return imagePath;
    } catch (error) {
      this.logger.error(`Erreur lors du téléchargement de l'image: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Calcule les dimensions de l'image pour conserver le ratio
   */
  private calculateImageDimensions(
    availableWidth: number,
    availableHeight: number,
    maxWidth: number,
    maxHeight: number,
  ): { width: number; height: number } {
    const width = Math.min(availableWidth, maxWidth);
    const height = Math.min(availableHeight, maxHeight);

    // Conserver le ratio 4:3 qui est souvent utilisé pour les documents
    if (width / height > 4 / 3) {
      return { width: (height * 4) / 3, height };
    } else {
      return { width, height: (width * 3) / 4 };
    }
  }

  /**
   * Groupe les réserves par document
   */
  private groupReservesByDocument(reserves: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};

    reserves.forEach((reserve) => {
      const documentName = reserve.documentName || 'Réserves sans plan';

      if (!grouped[documentName]) {
        grouped[documentName] = [];
      }

      grouped[documentName].push(reserve);
    });

    return grouped;
  }

  /**
   * Calcule la progression moyenne des lots
   */
  private calculateAverageProgress(taskProgress: any[]): number {
    if (!taskProgress || taskProgress.length === 0) return 0;

    const total = taskProgress.reduce((sum, task) => sum + (task.progress || 0), 0);
    return Math.round(total / taskProgress.length);
  }

  /**
   * Formate une date ISO en format français
   */
  private formatDate(isoDate?: string): string {
    if (!isoDate) return 'Non défini';

    try {
      const date = new Date(isoDate);
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    } catch (error) {
      return isoDate;
    }
  }

  /**
   * Retourne le texte pour un statut donné
   */
  private getStatusText(status?: string): string {
    if (!status) return 'Non défini';

    switch (status.toLowerCase()) {
      case 'completed':
        return 'Terminé';
      case 'in-progress':
        return 'En cours';
      case 'pending':
        return 'En attente';
      case 'on-hold':
        return 'En pause';
      default:
        return status;
    }
  }
}
