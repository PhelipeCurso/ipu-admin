import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import Layout from '../components/Layout';

function PdvPanel() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Painel do PDV</h1>
      <p>Bem-vindo ao ponto de venda! Aqui ficará a tela interativa.</p>
    </div>
  );
}

export default PdvPanel;
