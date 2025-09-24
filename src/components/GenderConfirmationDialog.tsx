import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { User, Users } from 'lucide-react';
import { Gender } from '@/hooks/useGenderDetection';

interface GenderConfirmationDialogProps {
  isOpen: boolean;
  detectedGender: Gender | null;
  confidence: number;
  onConfirm: (gender: Gender) => void;
  onCancel: () => void;
}

const GenderConfirmationDialog: React.FC<GenderConfirmationDialogProps> = ({
  isOpen,
  detectedGender,
  confidence,
  onConfirm,
  onCancel,
}) => {
  const [selectedGender, setSelectedGender] = React.useState<Gender>(
    detectedGender || 'prefer_not_to_say'
  );

  const handleConfirm = () => {
    onConfirm(selectedGender);
  };

  const confidenceText = confidence > 0.8 ? 'high' : confidence > 0.5 ? 'medium' : 'low';

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Confirm Your Gender
          </DialogTitle>
          <DialogDescription>
            {detectedGender && confidence > 0.5 ? (
              <>
                We detected you might be <strong>{detectedGender}</strong> with {confidenceText} confidence ({Math.round(confidence * 100)}%).
                Please confirm or select the correct option to see personalized styles.
              </>
            ) : (
              "Please select your gender to get personalized style recommendations tailored just for you."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup value={selectedGender} onValueChange={(value) => setSelectedGender(value as Gender)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female" className="cursor-pointer">Female</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male" className="cursor-pointer">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="cursor-pointer">Other</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="prefer_not_to_say" id="prefer_not_to_say" />
              <Label htmlFor="prefer_not_to_say" className="cursor-pointer">Prefer not to say</Label>
            </div>
          </RadioGroup>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="flex-1">
              Confirm & Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenderConfirmationDialog;