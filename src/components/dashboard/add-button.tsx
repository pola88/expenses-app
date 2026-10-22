'use client';

import { useQuickAdd } from '../quick-add/quick-add-provider';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { useTranslations } from 'next-intl';

export const AddButton = () => {
  const { setOpen } = useQuickAdd();
  const t = useTranslations('dashboard');

  return (
    <Button onClick={() => setOpen(true)} className="mb-2 hidden justify-start gap-2 md:flex">
      <Plus className="h-4 w-4" /> {t('add')}
    </Button>
  );
};
