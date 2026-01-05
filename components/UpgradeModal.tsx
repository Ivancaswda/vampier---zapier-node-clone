import React from 'react'
import {
    AlertDialog, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";

const UpgradeModal = ({open, onOpenChange}: any) => {




    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                        <AlertDialogTitle>
                            Обновить до про
                        </AlertDialogTitle>
                    <AlertDialogDescription>
                        Lorem ipsum dolor sit amet, consectetur
                        adipisicing elit. Adipisci alias expedita facere illo,
                        impedit ipsum molestias numquam officiis praesentium quod?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                        <AlertDialogCancel>
                            Отменить
                        </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>

        </AlertDialog>
    )
}
export default UpgradeModal
