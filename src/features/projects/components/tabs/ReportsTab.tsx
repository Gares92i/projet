import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { Plus, FileText, Calendar, User, Download, Eye } from 'lucide-react';

interface ReportsTabProps {
  projectId: string;
  formatDate: (dateString: string) => string;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ projectId, formatDate }) => {
  const [reports] = useState([
    {
      id: '1',
      title: 'Rapport de visite - Semaine 1',
      type: 'Visite de chantier',
      author: 'Jean Dupont',
      date: '2024-01-15',
      status: 'completed',
      progress: 85
    },
    {
      id: '2',
      title: 'Rapport de visite - Semaine 2',
      type: 'Visite de chantier',
      author: 'Marie Martin',
      date: '2024-01-22',
      status: 'in-progress',
      progress: 60
    },
    {
      id: '3',
      title: 'Rapport de réunion client',
      type: 'Réunion',
      author: 'Pierre Durand',
      date: '2024-01-20',
      status: 'draft',
      progress: 30
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'draft': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in-progress': return 'En cours';
      case 'draft': return 'Brouillon';
      default: return 'Inconnu';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Rapports du projet</CardTitle>
            <CardDescription>Gestion des rapports de visite et réunions</CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau rapport
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.length > 0 ? (
            reports.map((report) => (
              <div key={report.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{report.title}</h3>
                        <p className="text-sm text-muted-foreground">{report.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {report.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(report.date)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={getStatusColor(report.status)}>
                        {getStatusText(report.status)}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Progression:</span>
                        <span className="text-sm font-medium">{report.progress}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun rapport n'a été créé pour ce projet.</p>
              <p className="text-sm">Cliquez sur "Nouveau rapport" pour commencer.</p>
            </div>
          )}
        </div>

        {/* Statistiques des rapports */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-medium mb-4">Statistiques</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
              <div className="text-sm text-muted-foreground">Total des rapports</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Rapports terminés</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(reports.reduce((acc, r) => acc + r.progress, 0) / reports.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Progression moyenne</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
