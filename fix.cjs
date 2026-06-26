const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/page.jsx', 'utf8');

// 1. Add imports
code = code.replace(
  'import NowPlayingWrappedModal from \'@/components/dashboard/NowPlayingWrappedModal\';',
  'import NowPlayingWrappedModal from \'@/components/dashboard/NowPlayingWrappedModal\';\nimport Toast from \'@/components/ui/Toast\';\nimport ConfirmModal from \'@/components/ui/ConfirmModal\';'
);

// 2. Add state
const stateHook = '  const [user, setUser] = useState(null);';
const newState = `  const [user, setUser] = useState(null);
  
  // Custom UI State
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: () => {} });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };
`;
code = code.replace(stateHook, newState);

// 3. Replace alerts and confirms
code = code.replace(/alert\('Tidak ada hasil yang ditemukan untuk pencarian tersebut.'\);/g, 'showToast(\'Tidak ada hasil yang ditemukan untuk pencarian tersebut.\', \'info\');');
code = code.replace(/alert\('Pencarian gagal, silakan coba beberapa saat lagi.'\);/g, 'showToast(\'Pencarian gagal, silakan coba beberapa saat lagi.\', \'error\');');
code = code.replace(/alert\('Media ini sudah ada dalam daftar pelacakan Anda!'\);/g, 'showToast(\'Media ini sudah ada dalam daftar pelacakan Anda!\', \'warning\');');
code = code.replace(/alert\('Terjadi kesalahan saat menambah item: ' \+ err.message\);/g, 'showToast(\'Terjadi kesalahan saat menambah item: \' + err.message, \'error\');');
code = code.replace(/alert\('Gagal menambah item: ' \+ err.message\);/g, 'showToast(\'Gagal menambah item: \' + err.message, \'error\');');
code = code.replace(/alert\(\`"([^]+?)" berhasil ditambahkan ke rak pelacakan Anda!\`\);/g, 'showToast(`"$1" berhasil ditambahkan ke rak pelacakan Anda!`, \'success\');');
code = code.replace(/alert\('Gagal menghapus item: ' \+ err.message\);/g, 'showToast(\'Gagal menghapus item: \' + err.message, \'error\');');
code = code.replace(/alert\('Gagal memperbarui status: ' \+ err.message\);/g, 'showToast(\'Gagal memperbarui status: \' + err.message, \'error\');');
code = code.replace(/alert\('Gagal menambah progres: ' \+ err.message\);/g, 'showToast(\'Gagal menambah progres: \' + err.message, \'error\');');
code = code.replace(/alert\('Gagal merekam waktu sesi: ' \+ err.message\);/g, 'showToast(\'Gagal merekam waktu sesi: \' + err.message, \'error\');');
code = code.replace(/alert\('Media berhasil diarsipkan ke History Journal!'\);/g, 'showToast(\'Media berhasil diarsipkan ke History Journal!\', \'success\');');
code = code.replace(/alert\('Gagal mengarsipkan: ' \+ err.message\);/g, 'showToast(\'Gagal mengarsipkan: \' + err.message, \'error\');');

// handleDeleteItem modification
const oldDelete = `  const handleDeleteItem = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) return;
    try {
      const { error } = await supabase.from('media_items').delete().eq('id', id);
      if (error) throw error;
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Gagal menghapus item: ' + err.message);
    }
  };`;

const newDelete = `  const handleDeleteItem = (id) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Apakah Anda yakin ingin menghapus item ini dari rak pelacakan?',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          const { error } = await supabase.from('media_items').delete().eq('id', id);
          if (error) throw error;
          setItems(items.filter(item => item.id !== id));
          showToast('Item berhasil dihapus', 'success');
        } catch (err) {
          console.error('Error deleting item:', err);
          showToast('Gagal menghapus item: ' + err.message, 'error');
        }
      }
    });
  };`;
code = code.replace(oldDelete, newDelete);

// Append JSX for Toast and Modal before the final closing div tag
const lastDivIndex = code.lastIndexOf('</div>');
const injectJSX = `
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />
      <ConfirmModal 
        isOpen={confirmDialog.isOpen} 
        message={confirmDialog.message} 
        onConfirm={confirmDialog.onConfirm} 
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })} 
      />
`;
code = code.slice(0, lastDivIndex) + injectJSX + code.slice(lastDivIndex);

fs.writeFileSync('src/app/dashboard/page.jsx', code);
