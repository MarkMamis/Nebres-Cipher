import '@ionic/core/css/core.css';
import { defineCustomElement as defineIonApp } from '@ionic/core/components/ion-app.js';
import { defineCustomElement as defineIonContent } from '@ionic/core/components/ion-content.js';

defineIonApp();
defineIonContent();

const elements = {
  encryptTab: document.querySelector('#encryptTab'),
  decryptTab: document.querySelector('#decryptTab'),
  operationKicker: document.querySelector('#operationKicker'),
  operationTitle: document.querySelector('#operationTitle'),
  inputLabel: document.querySelector('#inputLabel'),
  inputHint: document.querySelector('#inputHint'),
  inputText: document.querySelector('#inputText'),
  shiftInput: document.querySelector('#shiftInput'),
  charCount: document.querySelector('#charCount'),
  runButton: document.querySelector('#runButton'),
  runLabel: document.querySelector('#runLabel'),
  resultSection: document.querySelector('#resultSection'),
  resultKicker: document.querySelector('#resultKicker'),
  resultTitle: document.querySelector('#resultTitle'),
  resultText: document.querySelector('#resultText'),
  resultMeta: document.querySelector('#resultMeta'),
  copyButton: document.querySelector('#copyButton'),
  downloadButton: document.querySelector('#downloadButton'),
  status: document.querySelector('#status')
};

let mode = 'encrypt';

function shiftText(text, shift) {
  return [...text].map(character => {
    const code = character.charCodeAt(0);
    const base = code >= 65 && code <= 90 ? 65 : code >= 97 && code <= 122 ? 97 : null;
    if (base === null) return character;
    return String.fromCharCode(((code - base + shift) % 26 + 26) % 26 + base);
  }).join('');
}

function setMode(nextMode) {
  mode = nextMode;
  const isEncrypt = mode === 'encrypt';
  elements.encryptTab.classList.toggle('active', isEncrypt);
  elements.decryptTab.classList.toggle('active', !isEncrypt);
  elements.encryptTab.setAttribute('aria-selected', String(isEncrypt));
  elements.decryptTab.setAttribute('aria-selected', String(!isEncrypt));
  elements.operationKicker.textContent = isEncrypt ? 'ENCODE MODE' : 'DECODE MODE';
  elements.operationTitle.textContent = isEncrypt ? 'Shift your message into cipher text' : 'Shift cipher text back to a message';
  elements.inputLabel.textContent = 'Message';
  elements.inputHint.textContent = 'Letters shift; spaces and punctuation stay unchanged';
  elements.inputText.placeholder = isEncrypt ? 'Type or paste your message here...' : 'Paste your encoded message here...';
  elements.runLabel.textContent = isEncrypt ? 'Encode message' : 'Decode message';
  elements.resultSection.hidden = true;
  elements.status.textContent = '';
  elements.status.classList.remove('success');
}

function showStatus(message, isSuccess = false) {
  elements.status.textContent = message;
  elements.status.classList.toggle('success', isSuccess);
}

async function runCipher() {
  const input = elements.inputText.value;
  const shift = Number(elements.shiftInput.value);
  if (!input.trim()) {
    showStatus('Enter a message first.');
    elements.inputText.focus();
    return;
  }
  if (!Number.isInteger(shift) || shift < -25 || shift > 25) {
    showStatus('Choose a whole-number shift between -25 and 25.');
    elements.shiftInput.focus();
    return;
  }

  elements.runButton.disabled = true;
  elements.runLabel.textContent = mode === 'encrypt' ? 'Encoding...' : 'Decoding...';
  showStatus('');
  try {
    const result = shiftText(input, mode === 'encrypt' ? shift : -shift);
    elements.resultText.value = result;
    elements.resultKicker.textContent = mode === 'encrypt' ? 'ENCODED OUTPUT' : 'DECODED OUTPUT';
    elements.resultTitle.textContent = mode === 'encrypt' ? 'Your encoded message' : 'Your decoded message';
    elements.resultMeta.textContent = `${result.length} characters · Shift ${mode === 'encrypt' ? shift : -shift}`;
    elements.copyButton.textContent = 'Copy';
    elements.resultSection.hidden = false;
    showStatus(mode === 'encrypt' ? 'Encoded locally in your browser.' : 'Decoded locally in your browser.', true);
  } catch (error) {
    showStatus('Something went wrong while shifting the message.');
    console.error(error);
  } finally {
    elements.runButton.disabled = false;
    elements.runLabel.textContent = mode === 'encrypt' ? 'Encode message' : 'Decode message';
  }
}

async function copyResult() {
  if (!elements.resultText.value) return;
  await navigator.clipboard.writeText(elements.resultText.value);
  elements.copyButton.textContent = 'Copied';
  setTimeout(() => { elements.copyButton.textContent = 'Copy'; }, 1600);
}

function downloadResult() {
  const blob = new Blob([elements.resultText.value], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = mode === 'encrypt' ? 'caesar-encoded.txt' : 'caesar-decoded.txt';
  link.click();
  URL.revokeObjectURL(link.href);
}

elements.encryptTab.addEventListener('click', () => setMode('encrypt'));
elements.decryptTab.addEventListener('click', () => setMode('decrypt'));
elements.runButton.addEventListener('click', runCipher);
elements.inputText.addEventListener('input', () => { elements.charCount.textContent = elements.inputText.value.length; });
elements.copyButton.addEventListener('click', copyResult);
elements.downloadButton.addEventListener('click', downloadResult);
[elements.inputText, elements.shiftInput].forEach(element => element.addEventListener('keydown', event => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) runCipher();
}));
