import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { Task, Group, ExportOptions } from '../types/planning';

// Enregistrement de polices pour un rendu optimal
Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZthjp-Ek-_EeAmM.woff", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZthjp-Ek-_EeAmM.woff", fontWeight: 700 },
  ],
});

// Ajouter cette fonction avant le composant PlanningPDF
// Fonction pour convertir les formats papier en points (taille PDF)
const convertPaperFormat = (format: string): [number, number] => {
  const formats: Record<string, [number, number]> = {
    'A0': [2383.94, 3370.39],
    'A1': [1683.78, 2383.94],
    'A2': [1190.55, 1683.78],
    'A3': [841.89, 1190.55],
    'A4': [595.28, 841.89],
    'Letter': [612, 792],
    'Legal': [612, 1008],
  };

  return formats[format.toUpperCase()] || formats['A4']; // Par défaut on retourne A4
};

interface PlanningPDFProps {
  projectId: string;
  visitDate: string;
  items: Task[];
  groups: Group[];
  options: ExportOptions;
}

interface MonthData {
  name: string;
  days: number;
  startDate: Date;
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Inter",
    fontSize: 9,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    borderBottomStyle: "solid",
  },
  companyInfo: {
    flexDirection: "row",
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  companyDetails: {
    fontSize: 9,
  },
  companyName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },
  date: {
    fontSize: 9,
    textAlign: "right",
  },
  projectInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  projectBlock: {
    width: "48%",
  },
  clientBlock: {
    width: "48%",
    alignItems: "flex-end",
  },
  label: {
    fontSize: 9,
    color: "#666",
    marginBottom: 2,
  },
  value: {
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#eee",
    borderStyle: "solid",
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    borderBottomStyle: "solid",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    borderBottomStyle: "solid",
    minHeight: 25,
  },
  taskNameCell: {
    width: 140,
    padding: 4,
    fontSize: 8,
    borderRightWidth: 1,
    borderRightColor: "#eee",
    borderRightStyle: "solid",
  },
  calendarCell: {
    flex: 1,
    flexDirection: "row",
  },
  monthHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    borderBottomStyle: "solid",
    backgroundColor: "#f9f9f9",
  },
  // Modifier les styles des mois
  monthCell: {
    textAlign: "center",
    padding: 4,
    fontSize: 8,
    fontWeight: "bold",
    backgroundColor: "#f0f0f0", // Plus contrasté
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    borderBottomStyle: "solid",
    borderRightWidth: 1,
    borderRightColor: "#eee",
    borderRightStyle: "solid",
  },
  dayHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    borderBottomStyle: "solid",
    backgroundColor: "#f9f9f9",
  },
  dayCell: {
    padding: 1, // Réduire le padding pour gagner de l'espace
    textAlign: "center",
    fontSize: 6, // Réduire la taille du texte pour les petits formats
    borderRightWidth: 1,
    borderRightColor: "#f0f0f0",
    borderRightStyle: "solid",
  },
  weekendCell: {
    backgroundColor: "#fff4f4", // Fond légèrement rouge pour les weekends
  },
  lotRow: {
    backgroundColor: "#fafafa",
  },
  lotTitle: {
    fontWeight: "bold",
    fontSize: 9,
    padding: 4,
  },
  taskBar: {
    height: 12,
    margin: "6px 0",
    borderRadius: 2,
  },
  taskCell: {
    position: "absolute",
    height: 20,
    borderRadius: 3,
    zIndex: 10,

  },
  taskLabel: {
    color: "black",
    fontSize: 7,
    paddingHorizontal: 2,
    paddingVertical: 4,
    width: 300,
  },
});

// Laisser les fonctions utilitaires qui ne dépendent pas du state ici
const formatDate = (timestamp: number) => {
  return dayjs(timestamp).locale('fr').format('DD MMM');
};

const getLotTimeRange = (lot: Group, tasksByLot: Record<string, Task[]>) => {
  // Cette fonction n'utilise pas start/end, donc peut rester ici
  const tasks = tasksByLot[lot.id] || [];
  
  if (tasks.length === 0) {
    return {
      start: 0,
      end: 0
    };
  }
  
  const startTimes = tasks.map(t => t.start_time);
  const endTimes = tasks.map(t => t.end_time);
  
  return {
    start: Math.min(...startTimes),
    end: Math.max(...endTimes)
  };
};

// Fonction principale pour générer le PDF
const PlanningPDF: React.FC<PlanningPDFProps> = ({ projectId, visitDate, items, groups, options }) => {
  dayjs.locale('fr');

  // Déterminer la plage de dates à afficher
  const getDateRange = () => {
    if (options.dateRange === "visible") {
      return {
        start: dayjs().subtract(15, "days").toDate(),
        end: dayjs().add(45, "days").toDate()
      };
    } else if (options.dateRange === "custom") {
      return {
        start: options.customStartDate,
        end: options.customEndDate
      };
    } else { // "all"
      if (items.length > 0) {
        const minDate = new Date(Math.min(...items.map(item => new Date(item.start_time).getTime())));
        const maxDate = new Date(Math.max(...items.map(item => new Date(item.end_time).getTime())));
        
        minDate.setDate(minDate.getDate() - 7);
        maxDate.setDate(maxDate.getDate() + 7);
        
        return { start: minDate, end: maxDate };
      }
      
      return {
        start: dayjs().subtract(1, "month").toDate(),
        end: dayjs().add(2, "months").toDate()
      };
    }
  };
  
  const { start, end } = getDateRange();

  const calculateDayWidth = () => {
    // Récupérer les dimensions du papier
    const [width, height] = convertPaperFormat(options.paperFormat);
    const isLandscape = options.orientation === 'landscape';
    
    // Largeur disponible (en tenant compte des marges et de la colonne des noms de tâches)
    const pageWidth = isLandscape ? width : height;
    const taskColumnWidth = 140;
    const margins = 40;
    const availableWidth = pageWidth - taskColumnWidth - margins;
    
    // Nombre total de jours à afficher
    const totalDays = dayjs(end).diff(dayjs(start), 'day') + 1;
    
    // Ajuster la largeur selon le format et l'orientation
    let calculatedWidth = Math.floor(availableWidth / totalDays);
    
    // Définir des valeurs minimales selon le format pour garantir la lisibilité
    if (options.paperFormat === 'A3' && isLandscape) {
      // A3 Paysage permet plus d'espace
      calculatedWidth = Math.max(12, Math.min(20, calculatedWidth));
    } else if (options.paperFormat === 'A3' && !isLandscape) {
      // A3 Portrait
      calculatedWidth = Math.max(10, Math.min(18, calculatedWidth));
    } else if (options.paperFormat === 'A4' && isLandscape) {
      // A4 Paysage
      calculatedWidth = Math.max(8, Math.min(15, calculatedWidth));
    } else {
      // A4 Portrait et autres formats
      calculatedWidth = Math.max(6, Math.min(12, calculatedWidth));
    }
    
    console.log(`Format: ${options.paperFormat} ${options.orientation}, Largeur jour: ${calculatedWidth}px`);
    return calculatedWidth;
  };

  const dayWidth = calculateDayWidth();
  
  // DÉPLACER CETTE FONCTION ICI - maintenant elle peut accéder à start et end
  const generateDays = () => {
    const days = [];
    
    // Normaliser les dates de début et fin (sans heure)
    const startDay = dayjs(start).startOf('day');
    const endDay = dayjs(end).endOf('day').startOf('day');
    
    console.log("Génération du calendrier:", 
      startDay.format('DD/MM/YYYY'), 
      "→", 
      endDay.format('DD/MM/YYYY'));
    
    let currentDay = startDay;
    
    while (currentDay.isBefore(endDay) || currentDay.isSame(endDay, 'day')) {
      // Utiliser un format YYYY-MM-DD cohérent
      const dateStr = currentDay.format('YYYY-MM-DD');
      // Stocker la date sans information de temps
      days.push(dayjs(dateStr).toDate());
      currentDay = currentDay.add(1, 'day');
    }
    
    return days;
  };
  
  const days = generateDays();
  
  // DÉPLACER CETTE FONCTION ICI AUSSI
  const getTaskPosition = (task, daysArray) => {
    // Normaliser les dates en UTC pour éviter les problèmes de fuseau horaire
    const startTimestamp = 'start_time' in task ? task.start_time : task.start;
    const endTimestamp = 'end_time' in task ? task.end_time : task.end;
    
    // Utiliser une méthode cohérente pour convertir en jours (sans heure)
    const taskStartDay = dayjs(startTimestamp).startOf('day');
    const taskEndDay = dayjs(endTimestamp).endOf('day').startOf('day');
    
    // Format YYYY-MM-DD pour comparaison stable
    const taskStartYMD = taskStartDay.format('YYYY-MM-DD');
    const taskEndYMD = taskEndDay.format('YYYY-MM-DD');
    
    // Trouver les indices exacts dans le tableau de jours
    let startIdx = -1;
    let endIdx = -1;
    
    for (let i = 0; i < daysArray.length; i++) {
      const currentDayYMD = dayjs(daysArray[i]).format('YYYY-MM-DD');
      
      if (currentDayYMD === taskStartYMD) {
        startIdx = i;
      }
      
      if (currentDayYMD === taskEndYMD) {
        endIdx = i;
      }
      
      // Optimisation: sortir de la boucle si les deux indices sont trouvés
      if (startIdx !== -1 && endIdx !== -1) break;
    }
    
    // Journaliser pour le débogage
    console.log(`Tâche: ${task.title}, Date début: ${taskStartYMD}, Date fin: ${taskEndYMD}`);
    console.log(`Indices trouvés: start=${startIdx}, end=${endIdx}`);
    
    // Gestion des cas où les dates sont en dehors de la plage affichée
    if (startIdx === -1) {
      // Trouver le premier jour visible qui suit la date de début
      for (let i = 0; i < daysArray.length; i++) {
        if (dayjs(daysArray[i]).isAfter(taskStartDay)) {
          startIdx = i;
          break;
        }
      }
      if (startIdx === -1) startIdx = 0;
    }
    
    if (endIdx === -1) {
      // Trouver le dernier jour visible avant la date de fin
      for (let i = daysArray.length - 1; i >= 0; i--) {
        if (dayjs(daysArray[i]).isBefore(taskEndDay)) {
          endIdx = i;
          break;
        }
      }
      if (endIdx === -1) endIdx = daysArray.length - 1;
    }
    
    // S'assurer que start n'est pas après end
    if (startIdx > endIdx) startIdx = endIdx;

    // S'assurer que les valeurs sont exactes
    console.log(`Tâche: ${task.title || 'lot'}, Position: ${startIdx} à ${endIdx}, Largeur: ${(endIdx - startIdx + 1) * dayWidth}px`);
    
    // Ajouter une vérification supplémentaire pour les indices hors limites
    if (startIdx < 0) startIdx = 0;
    if (endIdx >= daysArray.length) endIdx = daysArray.length - 1;
    if (startIdx > endIdx) startIdx = endIdx;
    
    return {
      start: startIdx,
      end: endIdx,
      width: (endIdx - startIdx + 1) * dayWidth
    };
  };
  
  const generateMonths = (): MonthData[] => {
    const months: MonthData[] = [];
    
    if (days.length === 0) return months;
    
    let currentMonth = dayjs(days[0]).format('MMMM YY');
    let monthDays = 0;
    let monthStart = new Date(days[0]);
    
    days.forEach((day) => {
      const dayMonth = dayjs(day).format('MMMM YY');
      
      if (dayMonth !== currentMonth) {
        months.push({ 
          name: currentMonth, 
          days: monthDays,
          startDate: new Date(monthStart)
        });
        
        currentMonth = dayMonth;
        monthDays = 1;
        monthStart = new Date(day);
      } else {
        monthDays++;
      }
    });
    
    if (monthDays > 0) {
      months.push({ 
        name: currentMonth, 
        days: monthDays,
        startDate: new Date(monthStart)
      });
    }
    
    return months;
  };
  
  const months = generateMonths();

  // 3. Ajouter avant le return final pour vérifier l'alignement
  console.log("Début du planning: ", dayjs(days[0]).format('DD/MM/YYYY'));
  console.log("Fin du planning: ", dayjs(days[days.length-1]).format('DD/MM/YYYY'));
  console.log("Premier mois: ", months[0].name, "avec", months[0].days, "jours");
  
  const getTasksByLot = () => {
    const tasksByLot: Record<string, Task[]> = {};
    
    const lots = groups.filter(g => !g.parentId);

    lots.forEach(lot => {
      const lotTasks: Task[] = [];
      
      const taskGroups = groups.filter(g => g.parentId === lot.id);
      
      taskGroups.forEach(taskGroup => {
        const taskId = taskGroup.id.startsWith('task-') 
          ? taskGroup.id.substring(5)
          : taskGroup.id;
          
        const task = items.find(item => item.id === taskId);
        if (task) {
          lotTasks.push({
            ...task,
            group: taskGroup.id,
            title: taskGroup.title.split(' ').slice(1).join(' ') || task.title
          });
        }
      });
      
      tasksByLot[lot.id] = lotTasks;
    });
    
    return { tasksByLot, lots };
  };
  
  const { tasksByLot, lots } = getTasksByLot();
  
  return (
    <Document>
      <Page
        size={convertPaperFormat(options.paperFormat)}
        orientation={options.orientation}
        style={styles.page}
      >
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <View style={styles.logo}></View>
            <View style={styles.companyDetails}>
              <Text style={styles.companyName}>Cabinet d'Architecture Moderne</Text>
              <Text>15 rue de l'Innovation, 75001 Paris</Text>
              <Text>+33 1 23 45 67 89</Text>
              <Text>contact@architecturemoderne.fr</Text>
            </View>
          </View>
          <View>
            <Text style={styles.title}>PLANNING TRAVAUX</Text>
            <Text style={styles.date}>Date: {dayjs(visitDate).format('D MMMM YYYY')}</Text>
          </View>
        </View>
        
        <View style={styles.projectInfo}>
          <View style={styles.projectBlock}>
            <Text style={styles.label}>Projet</Text>
            <Text style={styles.value}>Villa Moderna</Text>
            <Text>Aix-en-Provence, France</Text>
          </View>
          <View style={styles.clientBlock}>
            <Text style={styles.label}>Client</Text>
            <Text style={styles.value}>Famille Martin</Text>
            <Text>Période: 15 janvier 2023 - 30 décembre 2023</Text>
          </View>
        </View>
        
        <View style={styles.table}>
          <View style={styles.monthHeaderRow}>
            <View style={[styles.taskNameCell, { borderRightWidth: 1, borderRightColor: "#eee", borderRightStyle: "solid" }]}>
              <Text></Text>
            </View>
            {months.map((month, idx) => (
              <View key={`month-${idx}`} style={[
                styles.monthCell,
                { width: month.days * dayWidth } // Utiliser dayWidth ici aussi
              ]}>
                <Text>{month.name}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.dayHeaderRow}>
            <View style={[styles.taskNameCell, { borderRightWidth: 1, borderRightColor: "#eee", borderRightStyle: "solid" }]}>
              <Text>Tâches</Text>
            </View>
            <View style={styles.calendarCell}>
              {days.map((day, idx) => {
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const dateNum = day.getDate();
                
                return (
                  <View key={`day-${idx}`} style={[
                    styles.dayCell,
                    { 
                      width: dayWidth,
                      fontSize: dayWidth < 10 ? 5 : 7 // Réduire encore plus la taille pour les formats très compressés
                    },
                    isWeekend && styles.weekendCell
                  ]}>
                    <Text style={{ 
                      color: isWeekend ? "#FF0000" : "#000000",
                      fontWeight: isWeekend ? "bold" : "normal"
                    }}>
                      {dateNum}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
          
          {lots.map((lot, lotIndex) => {
            const lotTimeRange = getLotTimeRange(lot, tasksByLot);
            const lotPosition = getTaskPosition(lotTimeRange, days);
            
            return (
              <React.Fragment key={`lot-${lot.id}`}>
                <View style={[styles.tableRow, { backgroundColor: `${lot.lotColor}20` }]}>
                  <View style={[styles.taskNameCell, { borderRightWidth: 1, borderRightColor: "#eee", borderRightStyle: "solid" }]}>
                    <Text style={[styles.lotTitle, { color: lot.lotColor }]}>
                      {`${lotIndex + 1}. ${lot.title.split('.').pop().trim()}`}
                    </Text>
                  </View>
                  <View style={styles.calendarCell}>
                    <View style={{
                      backgroundColor: lot.lotColor,
                      position: "absolute",
                      left: lotPosition.start * dayWidth,
                      width: lotPosition.width,
                      top: "50%",
                      marginTop: -5,
                      height: 10,
                      opacity: 0.3
                    }} />
                  </View>
                </View>
                
                {tasksByLot[lot.id]?.map((task, taskIdx) => {
                  const position = getTaskPosition(task, days);
                  return (
                    <View key={`task-${task.id}-${taskIdx}`} style={styles.tableRow}>
                      <View style={[styles.taskNameCell, { borderRightWidth: 1, borderRightColor: "#eee", borderRightStyle: "solid" }]}>
                        <Text>{options.showTaskNames ? `${lotIndex + 1}.${taskIdx + 1} ${task.title}` : ""}</Text>
                      </View>
                      <View style={styles.calendarCell}>
                        <View style={[
                          styles.taskCell,
                          {
                            left: position.start * dayWidth, // Utiliser dayWidth
                            width: position.width, // position.width est déjà calculé avec dayWidth
                            backgroundColor: lot.lotColor,
                            top: 2.5
                          }
                        ]}>
                          <Text style={styles.taskLabel}>
                            {`${lotIndex + 1}.${taskIdx + 1} ${task.title} (${formatDate(task.start_time)}-${formatDate(task.end_time)})`}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </React.Fragment>
            );
          })}
        </View>
      </Page>
    </Document>
  );
};

export default PlanningPDF;