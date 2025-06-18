import React, { useEffect, useRef, useState } from "react";
import {
  FileText,
  ChevronDown,
  FolderOpen,
  Plus,
 Trash2,
  X,
   Delete,
  FilePenLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Document } from "@/app/styles";
import { Button } from "@/components/ui/button";
import { DialogDocumentName } from "@/components/annotations/DialogDocumentName";
// Ajoutez en haut du fichier, avec les autres imports
import { toast } from "sonner";

interface DocumentsSidebarProps {
  documents: Document[];
  activeDocument: Document | null;
  onSelectDocument: (document: Document) => void;
  onAddDocument?: () => void;
  onDeleteDocument?: (documentId: string) => void;
}

export const DocumentsSidebar: React.FC<DocumentsSidebarProps> = ({
  documents,
  activeDocument,
  onSelectDocument,
  onAddDocument,
  onDeleteDocument,
}) => {
  // Effet pour logger les documents à chaque modification
  const prevDocLength = useRef(documents.length);

  useEffect(() => {
    if (prevDocLength.current !== documents.length) {
      console.log(
        "Documents mis à jour dans sidebar:",
        documents.map((d) => ({ id: d.id, name: d.name }))
      );
      prevDocLength.current = documents.length;
    }
  }, [documents]);

  // Ajoutez une référence pour faire défiler automatiquement vers le document actif
  const activeItemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeDocument?.id]);

  // Raccourcir les noms de fichiers trop longs pour l'affichage
  const formatFileName = (name: string) => {
    if (!name) return "Sans titre";
    if (name.length > 28) {
      return name.substring(0, 12) + "..." + name.substring(name.length - 12);
    }
    return name;
  };

  // Tri des documents : les plus récents en premier (ID contient timestamp)
  const sortedDocuments = [...documents].sort((a, b) => {
    const idA = a.id.includes("-") ? parseInt(a.id.split("-")[1]) : 0;
    const idB = b.id.includes("-") ? parseInt(b.id.split("-")[1]) : 0;
    return idB - idA; // Ordre décroissant (plus récent en premier)
  });

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [newDocumentName, setNewDocumentName] = useState<string>("");

  const handleDocumentRename = (document: Document) => {
    setSelectedDocument(document);
    setIsRenameDialogOpen(true);
  };

  const handleDocumentNameSave = (name: string) => {
    if (!selectedDocument) return;

    const updatedDocuments = [...documents];
    const index = updatedDocuments.findIndex(
      (doc) => doc.id === selectedDocument.id
    );
    if (index !== -1) {
      updatedDocuments[index].name = name;
    }

    onSelectDocument(
      updatedDocuments.find((doc) => doc.id === selectedDocument.id)!
    );
    setIsRenameDialogOpen(false);
  };

  const handleDialogClosed = () => {
    setIsRenameDialogOpen(false);
    setSelectedDocument(null);
    setNewDocumentName("");
  };
  // Ajoutez cette fonction après les autres fonctions, avant le return
  const handleDeleteDocument = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la sélection du document

    if (
      window.confirm(
        `Voulez-vous vraiment supprimer le document "${
          doc.name || "Sans titre"
        }" ?`
      )
    ) {
      console.log("Suppression du document:", doc.id);
      onDeleteDocument?.(doc.id);
    }
  };

  return (
    <div className="w-72 border-r bg-card flex flex-col h-full">
      <div className="p-3 border-b flex items-center justify-between">
        <h2 className="font-medium text-sm">Documents</h2>
        <span className="text-xs text-muted-foreground">
          {documents.length} document{documents.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-2">
          <div className="flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer">
            <div className="flex items-center">
              <FolderOpen className="h-4 w-4 mr-2" />
              <span className="font-medium text-sm">Plans du projet</span>
            </div>
            {onAddDocument && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddDocument();
                }}>
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="mt-2 ml-6">
            {sortedDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <FolderOpen className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-xs">Aucun document disponible</p>
                <p className="text-xs mt-1">Ajoutez un plan pour commencer</p>
                {onAddDocument && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={onAddDocument}>
                    <Plus className="h-3 w-3 mr-1" />
                    Ajouter un document
                  </Button>
                )}
              </div>
            ) : (
              <div className="mt-2">
                <h3 className="mb-1 font-medium text-xs pl-2">
                  Documents ({sortedDocuments.length})
                </h3>

                <ul className="space-y-1.5 pr-1">
                  {" "}
                  {/* Augmenté l'espacement vertical et réduit la marge à droite */}
                  {sortedDocuments.map((doc) => (
                    <li
                      key={doc.id}
                      ref={activeDocument?.id === doc.id ? activeItemRef : null}
                      className={cn(
                        "flex items-center py-1.5 px-3 rounded cursor-pointer group transition-colors", // Augmenté le padding
                        activeDocument?.id === doc.id
                          ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                          : "hover:bg-accent"
                      )}
                      onClick={() => onSelectDocument(doc)}>
                      {/* Bouton de renommage avec meilleur espacement */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 mr-2 flex-shrink-0" // Augmenté la taille et la marge
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDocumentRename(doc);
                        }}
                        title="Renommer">
                        <FilePenLine className="h-3 w-3" />{" "}
                        {/* Icône légèrement plus grande */}
                      </Button>

                      {/* Nom du document avec plus d'espace */}
                      <span
                        className="text-xs truncate flex-1 mx-1" // Ajout de marge horizontale
                        title={doc.name}>
                        {formatFileName(doc.name)}
                      </span>

                      {/* Actions et badges */}
                      <div className="flex items-center space-x-2 ml-2">
                        {" "}
                        {/* Augmenté l'espacement */}
                        {/* Badge d'annotations */}
                        {doc.annotations?.length > 0 && (
                          <div className="bg-orange-100 text-orange-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                            <span className="text-[9px] font-bold">
                              {doc.annotations.length}
                            </span>
                          </div>
                        )}
                        {/* Bouton de suppression simplifié */}
                        {onDeleteDocument && (
                          <button
                            type="button"
                            className="p-1.5 rounded-sm text-red-500 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                            onClick={(e) => handleDeleteDocument(doc, e)}
                            title="Supprimer le document">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ajoutez un indicateur de document actif */}
      {activeDocument && (
        <div className="px-3 py-2 border-t text-xs text-muted-foreground">
          <p className="truncate font-medium">Document actif:</p>
          <p className="truncate italic">{activeDocument.name}</p>
        </div>
      )}

      {isRenameDialogOpen && (
        <DialogDocumentName
          isOpen={isRenameDialogOpen}
          onClose={handleDialogClosed}
          onSave={(name) => handleDocumentNameSave(name)}
          defaultName={selectedDocument?.name || ""}
        />
      )}
    </div>
  );
};
