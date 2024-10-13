<template>
    <v-container fluid>
        <v-row justify="center">
            <v-col cols="12" sm="10" md="8">
                <v-card>
                    <v-card-title>
                        <span class="headline">Manajemen Stok</span>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" @click="openStokDialog('add')">Tambah Stok</v-btn>
                        <v-btn color="warning" @click="openStokDialog('subtract')">Kurangi Stok</v-btn>
                    </v-card-title>
                    <v-card-text>
                        <v-data-table :headers="headers" :items="barangs" item-key="id" class="elevation-1">
                            <template v-slot:[`item.actions`]="{ item }">
                                <v-icon small @click="openStokDialog('adjust', item)">mdi-pencil</v-icon>
                            </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>

                <v-dialog v-model="dialog" max-width="500px">
                    <v-card>
                        <v-card-title>
                            <span class="headline">{{ dialogTitle }}</span>
                        </v-card-title>
                        <v-card-text>
                            <v-form ref="form" v-model="valid">
                                <v-select v-model="selectedBarang" :items="barangs" item-text="nama" item-value="id"
                                    label="Pilih Barang" outlined required
                                    :disabled="dialogType !== 'adjust'"></v-select>
                                <v-text-field v-model="input.jumlah" label="Jumlah" outlined type="number"
                                    :rules="[v => !!v || 'Jumlah harus diisi']"></v-text-field>
                            </v-form>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="red" @click="dialog = false">Batal</v-btn>
                            <v-btn color="green darken-1" @click="updateStok">{{ dialogAction }}</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/firestore';

export default {
    data() {
        return {
            dialog: false,
            valid: false,
            dialogType: 'add', // 'add', 'subtract'
            selectedBarang: null,
            input: {
                jumlah: 0,
            },
            headers: [
                { text: 'Nama Barang', value: 'nama' },
                { text: 'Kategori', value: 'kategori' },
                { text: 'Harga', value: 'harga' },
                { text: 'Stok', value: 'stok' },
                { text: 'Satuan', value: 'satuan' },
                { text: 'Aksi', value: 'actions', sortable: false }
            ],
            barangs: [],
        };
    },
    computed: {
        dialogTitle() {
            if (this.dialogType === 'add') return 'Tambah Stok';
            if (this.dialogType === 'subtract') return 'Kurangi Stok';
            return 'Penyesuaian Stok'; // Nilai default atau untuk kasus lain
        },
        dialogAction() {
            if (this.dialogType === 'add') return 'Tambah';
            if (this.dialogType === 'subtract') return 'Kurangi';
            return 'Sesuaikan'; // Nilai default atau untuk kasus lain
        }
    },

    created() {
        this.fetchBarangs();
    },
    methods: {
        async fetchBarangs() {
            const snapshot = await firebase.firestore().collection('barangs').get();
            this.barangs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        async updateStok() {
            if (this.$refs.form.validate()) {
                try {
                    const barangDoc = firebase.firestore().collection('barangs').doc(this.selectedBarang);
                    const barang = await barangDoc.get();

                    let currentStok = barang.data().stok;
                    let newStok = 0;

                    if (this.dialogType === 'add') {
                        newStok = currentStok + Number(this.input.jumlah);
                    } else if (this.dialogType === 'subtract') {
                        newStok = currentStok - Number(this.input.jumlah);
                        if (newStok < 0) {
                            alert('Stok tidak boleh kurang dari nol.');
                            return;
                        }
                    }

                    await barangDoc.update({ stok: newStok });

                    // Catat transaksi
                    await firebase.firestore().collection('transaksi').add({
                        barang: barang.data().nama,
                        jenis: this.dialogType === 'add' ? 'Tambah' : 'Kurangi',
                        jumlah: this.input.jumlah,
                        tanggal: firebase.firestore.FieldValue.serverTimestamp(),
                    });

                    this.dialog = false;
                    this.fetchBarangs();
                    this.resetForm();
                } catch (error) {
                    console.error('Error updating stock:', error);
                }
            }
        },
        openStokDialog(type, item = null) {
            this.dialogType = type;
            if (item) {
                this.selectedBarang = item.id;
            } else {
                this.selectedBarang = null;
            }
            this.input.jumlah = 0; // Reset jumlah ke 0 setiap kali dialog dibuka
            this.dialog = true;
        },
        resetForm() {
            this.input.jumlah = 0;
            this.selectedBarang = null;
        }
    }
};
</script>

<style scoped>
.register-card {
    margin-top: 32px;
}
</style>