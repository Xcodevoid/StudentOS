import { CloudUpload } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'

export default function MigrationPrompt() {
  const { migrationOffer, acceptMigration, declineMigration } = useStore()

  return (
    <Modal
      open={Boolean(migrationOffer)}
      onClose={declineMigration}
      title="Import your local data?"
      footer={
        <>
          <Button variant="ghost" onClick={declineMigration}>Start fresh instead</Button>
          <Button onClick={acceptMigration}>Import to my account</Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center py-2">
        <div className="w-12 h-12 rounded-2xl bg-accent-50 dark:bg-accent-500/15 flex items-center justify-center mb-3">
          <CloudUpload size={22} className="text-accent-600 dark:text-accent-400" />
        </div>
        <p className="text-[14px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
          We found classes, exams, or projects saved on this device from before you signed in. Import them into your
          new account so nothing is lost — they'll then be available on any device you sign into.
        </p>
      </div>
    </Modal>
  )
}
