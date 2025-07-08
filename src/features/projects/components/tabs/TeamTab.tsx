import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/dialog';
import { Plus, Mail, Phone, UserPlus, Users } from 'lucide-react';
import { TeamMember } from '@/features/team/types/team';

interface TeamTabProps {
  projectId: string;
  teamMembers: TeamMember[];
  onDataUpdate?: (payload: any) => void;
}

export const TeamTab: React.FC<TeamTabProps> = ({ projectId, teamMembers, onDataUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: '',
    phone: ''
  });

  const handleAddMember = () => {
    // Logique pour ajouter un membre
    console.log('Ajouter membre:', newMember);
    setIsDialogOpen(false);
    setNewMember({
      name: '',
      email: '',
      role: '',
      phone: ''
    });
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'chef de projet': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'architecte': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ingénieur': return 'bg-green-100 text-green-700 border-green-200';
      case 'technicien': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Équipe du projet</CardTitle>
            <CardDescription>Gestion des membres de l'équipe</CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Ajouter membre
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamMembers.length > 0 ? (
            teamMembers.map((member) => (
              <div key={member.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{member.name}</h3>
                      <Badge variant="outline" className={getRoleColor(member.role)}>
                        {member.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {member.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      Modifier
                    </Button>
                    <Button variant="ghost" size="sm">
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun membre n'a été ajouté à l'équipe.</p>
              <p className="text-sm">Cliquez sur "Ajouter membre" pour commencer.</p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Dialog pour ajouter un membre */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un membre à l'équipe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={newMember.name}
                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                placeholder="Ex: Jean Dupont"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                placeholder="jean.dupont@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select value={newMember.role} onValueChange={(value) => setNewMember({...newMember, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chef de projet">Chef de projet</SelectItem>
                  <SelectItem value="Architecte">Architecte</SelectItem>
                  <SelectItem value="Ingénieur">Ingénieur</SelectItem>
                  <SelectItem value="Technicien">Technicien</SelectItem>
                  <SelectItem value="Ouvrier">Ouvrier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone (optionnel)</Label>
              <Input
                id="phone"
                value={newMember.phone}
                onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                placeholder="+33 1 23 45 67 89"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddMember}>
              Ajouter le membre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
