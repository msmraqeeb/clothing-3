
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold, Italic, List, ListOrdered, Quote, AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Maximize2, Type, ChevronDown, MoreHorizontal,
  Minus, Eraser, HelpCircle, Redo, Undo, Code as CodeIcon,
  Minimize2, Palette, Smile, Type as TypeIcon, X
} from 'lucide-react';

import { supabase } from '../lib/supabase';
import { uploadToCloudinary } from '../lib/cloudinary';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  height?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, label, height = '300px' }) => {
  const [isVisual, setIsVisual] = useState(true);
  const [showSecondRow, setShowSecondRow] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showParagraphMenu, setShowParagraphMenu] = useState(false);
  const [showSpecialChars, setShowSpecialChars] = useState(false);
  const [pasteAsText, setPasteAsText] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [wordCount, setWordCount] = useState(0);



  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc'
  ];

  const specialChars = ['©', '®', '™', '§', '¶', '†', '‡', '•', '…', '‰', '′', '″', '‹', '›', '«', '»', '–', '—', '±', '×', '÷', '≈', '≠', '≤', '≥', '∞', 'µ', 'π', 'Ω', '€', '£', '¥', '¢', '¤', '¿', '¡'];

  const updateWordCount = useCallback((html: string) => {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    setWordCount(text ? text.split(' ').length : 0);
  }, []);

  useEffect(() => {
    if (editorRef.current && isVisual) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '<p><br></p>';
      }
    }
    updateWordCount(value || '');
  }, [value, isVisual, updateWordCount]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadToCloudinary(file);
      execCommand('insertImage', url);
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      updateWordCount(html);
    }
  };

  const execCommand = (command: string, val: string = '') => {
    editorRef.current?.focus();
    // Fix: formatBlock expects 'h1', 'p' etc. not '<h1>'
    const finalVal = val;
    document.execCommand(command, false, finalVal);
    handleInput();
    setShowColorPicker(false);
    setShowParagraphMenu(false);
    setShowSpecialChars(false);
  };

  const insertAtCursor = (text: string) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
    handleInput();
    setShowSpecialChars(false);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (pasteAsText) {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    }
  };

  const toolbarBtnClass = (active: boolean = false) => `p-2 rounded border transition-all text-gray-600 flex items-center justify-center ${active ? 'bg-gray-200 border-gray-400' : 'bg-transparent border-transparent hover:bg-gray-100 hover:border-gray-300'}`;

  return (
    <div className={`flex flex-col border border-gray-300 rounded bg-white font-sans text-sm shadow-sm transition-all ${isFullscreen ? 'fixed inset-0 z-[2000] rounded-none' : 'w-full'}`}>
      <style>{`
        .rich-editor-visual h1 { font-size: 2em !important; font-weight: bold !important; margin-bottom: 0.5em !important; display: block !important; }
        .rich-editor-visual h2 { font-size: 1.5em !important; font-weight: bold !important; margin-bottom: 0.5em !important; display: block !important; }
        .rich-editor-visual h3 { font-size: 1.17em !important; font-weight: bold !important; margin-bottom: 0.5em !important; display: block !important; }
        .rich-editor-visual ul { list-style-type: disc !important; padding-left: 2.5em !important; margin: 1em 0 !important; display: block !important; }
        .rich-editor-visual ol { list-style-type: decimal !important; padding-left: 2.5em !important; margin: 1em 0 !important; display: block !important; }
        .rich-editor-visual li { display: list-item !important; margin-bottom: 0.25em !important; }
        .rich-editor-visual blockquote { border-left: 4px solid #e5e7eb !important; padding-left: 1em !important; margin: 1em 0 !important; font-style: italic !important; color: #6b7280 !important; }
        .rich-editor-visual a { color: #10b981 !important; text-decoration: underline !important; }
        .rich-editor-visual p { margin-bottom: 1em !important; }
      `}</style>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
        accept="image/*"
      />

      {/* Top Header with Tabs */}
      <div className="flex justify-between items-center bg-gray-50 border-b border-gray-200 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              fileInputRef.current?.click();
            }}
            disabled={isUploading}
            className={`flex items-center gap-1.5 bg-white border border-gray-300 px-3 py-1 rounded-md text-xs font-bold text-emerald-700 shadow-sm hover:bg-gray-50 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
          >
            <Maximize2 size={12} /> {isUploading ? 'Uploading...' : 'Add Media'}
          </button>
          <HelpCircle size={14} className="text-gray-400 cursor-help" />
        </div>
        <div className="flex bg-gray-200/50 p-0.5 rounded-lg">
          <button type="button" onClick={() => setIsVisual(true)} className={`px-4 py-1 text-xs font-bold rounded-md transition-all ${isVisual ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}>Visual</button>
          <button type="button" onClick={() => setIsVisual(false)} className={`px-4 py-1 text-xs font-bold rounded-md transition-all ${!isVisual ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}>Code</button>
        </div>
      </div>

      {/* Toolbar */}
      {
        isVisual && (
          <div className="bg-[#f7f7f7] border-b border-gray-200 p-2 flex flex-col gap-2 select-none">
            {/* Row 1 */}
            <div className="flex flex-wrap items-center gap-1 relative">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowParagraphMenu(!showParagraphMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md bg-white text-xs font-bold text-gray-600 hover:border-gray-400 min-w-[120px] justify-between shadow-sm"
                >
                  Paragraph <ChevronDown size={14} className="text-gray-400" />
                </button>
                {showParagraphMenu && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-2xl rounded-xl py-2 z-50 min-w-[180px] animate-in fade-in zoom-in-95 duration-200">
                    {[
                      { label: 'Paragraph', val: 'p' },
                      { label: 'Heading 1', val: 'h1' },
                      { label: 'Heading 2', val: 'h2' },
                      { label: 'Heading 3', val: 'h3' },
                      { label: 'Heading 4', val: 'h4' },
                      { label: 'Heading 5', val: 'h5' },
                      { label: 'Heading 6', val: 'h6' },
                      { label: 'Preformatted', val: 'pre' }
                    ].map(item => (
                      <button key={item.val} type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', item.val); }} className="w-full text-left px-5 py-2.5 hover:bg-emerald-50 text-xs font-bold text-gray-700 transition-colors">{item.label}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-[1px] h-5 bg-gray-300 mx-1" />
              <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('bold'); }} className={toolbarBtnClass()} title="Bold"><Bold size={18} /></button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('italic'); }} className={toolbarBtnClass()} title="Italic"><Italic size={18} /></button>
              <div className="w-[1px] h-5 bg-gray-300 mx-1" />
              <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('insertUnorderedList'); }} className={toolbarBtnClass()} title="Unordered List"><List size={18} /></button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('insertOrderedList'); }} className={toolbarBtnClass()} title="Ordered List"><ListOrdered size={18} /></button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', 'blockquote'); }} className={toolbarBtnClass()} title="Blockquote"><Quote size={18} /></button>
              <div className="w-[1px] h-5 bg-gray-300 mx-1" />
              <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyLeft'); }} className={toolbarBtnClass()} title="Align Left"><AlignLeft size={18} /></button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyCenter'); }} className={toolbarBtnClass()} title="Align Center"><AlignCenter size={18} /></button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyRight'); }} className={toolbarBtnClass()} title="Align Right"><AlignRight size={18} /></button>
              <div className="w-[1px] h-5 bg-gray-300 mx-1" />
              <button type="button" onMouseDown={(e) => { e.preventDefault(); const url = prompt('Enter URL:'); if (url) execCommand('createLink', url); }} className={toolbarBtnClass()} title="Insert Link"><LinkIcon size={18} /></button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('insertHorizontalRule'); }} className={toolbarBtnClass()} title="Insert Read More"><MoreHorizontal size={18} /></button>
              <div className="w-[1px] h-5 bg-gray-300 mx-1" />
              <button type="button" onClick={() => setShowSecondRow(!showSecondRow)} className={toolbarBtnClass(showSecondRow)} title="Toolbar Toggle"><TypeIcon size={18} /></button>
              <button type="button" onClick={() => setIsFullscreen(!isFullscreen)} className={toolbarBtnClass(isFullscreen)} title="Distraction Free Writing">{isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
            </div>

            {/* Row 2 (Kitchen Sink) */}
            {showSecondRow && (
              <div className="flex flex-wrap items-center gap-1 animate-in slide-in-from-top-1 duration-300">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('strikeThrough'); }} className={toolbarBtnClass()} title="Strikethrough"><span className="font-serif line-through font-black text-sm">abc</span></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('insertHorizontalRule'); }} className={toolbarBtnClass()} title="Horizontal Line"><Minus size={18} /></button>

                <div className="relative">
                  <button type="button" onClick={() => { setShowColorPicker(!showColorPicker); setShowSpecialChars(false); }} className={toolbarBtnClass(showColorPicker)} title="Text Color">
                    <div className="flex flex-col items-center leading-none">
                      <span className="font-black text-sm">A</span>
                      <div className="w-4 h-1 bg-red-500 rounded-full"></div>
                    </div>
                  </button>
                  {showColorPicker && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-2xl rounded-2xl p-4 z-[100] w-[260px] animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Select Color</span>
                        <button onClick={() => setShowColorPicker(false)} className="text-gray-300 hover:text-red-500"><X size={14} /></button>
                      </div>
                      <div className="grid grid-cols-7 gap-1.5">
                        {colors.map(color => (
                          <button
                            key={color}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); execCommand('foreColor', color); }}
                            className="w-7 h-7 rounded-lg border border-gray-100 hover:scale-110 hover:shadow-md transition-all active:scale-95"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button type="button" onClick={() => setPasteAsText(!pasteAsText)} className={toolbarBtnClass(pasteAsText)} title="Paste as Text"><Eraser size={18} className={pasteAsText ? 'text-blue-500' : ''} /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('removeFormat'); }} className={toolbarBtnClass()} title="Clear Formatting"><Eraser size={18} /></button>

                <div className="relative">
                  <button type="button" onClick={() => { setShowSpecialChars(!showSpecialChars); setShowColorPicker(false); }} className={toolbarBtnClass(showSpecialChars)} title="Special Character">
                    <span className="font-serif font-black text-lg">Ω</span>
                  </button>
                  {showSpecialChars && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 shadow-2xl rounded-2xl p-4 z-[100] w-[280px] animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Special Symbols</span>
                        <button onClick={() => setShowSpecialChars(false)} className="text-gray-300 hover:text-red-500"><X size={14} /></button>
                      </div>
                      <div className="grid grid-cols-6 gap-2">
                        {specialChars.map(char => (
                          <button
                            key={char}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); insertAtCursor(char); }}
                            className="w-9 h-9 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-sm rounded-xl flex items-center justify-center text-lg font-medium transition-all active:scale-90 bg-gray-50 border border-transparent"
                          >
                            {char}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('outdent'); }} className={toolbarBtnClass()} title="Decrease Indent"><AlignLeft size={18} className="rotate-180" /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('indent'); }} className={toolbarBtnClass()} title="Increase Indent"><AlignLeft size={18} /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('undo'); }} className={toolbarBtnClass()} title="Undo"><Undo size={18} /></button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('redo'); }} className={toolbarBtnClass()} title="Redo"><Redo size={18} /></button>
                <button type="button" className={toolbarBtnClass()} title="Keyboard Shortcuts"><HelpCircle size={18} /></button>
              </div>
            )}
          </div>
        )
      }

      {/* Main Editing Area */}
      <div className="relative flex-1 overflow-hidden bg-white" style={{ height: isFullscreen ? 'calc(100vh - 120px)' : height }}>
        {isVisual ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onPaste={handlePaste}
            className="w-full h-full p-6 outline-none prose prose-emerald max-w-none overflow-y-auto focus:ring-0 selection:bg-emerald-100 rich-editor-visual"
            style={{ minHeight: isFullscreen ? '100%' : height }}
            onBlur={handleInput}
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full p-6 outline-none font-mono text-sm bg-gray-900 text-emerald-400 resize-none border-none custom-scrollbar"
            style={{ minHeight: isFullscreen ? '100%' : height }}
            placeholder="<html>Code here...</html>"
          />
        )}
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center bg-[#f7f7f7] border-t border-gray-200 px-4 py-2 text-[11px] text-gray-500 font-bold">
        <div className="flex gap-4">
          <span className="uppercase tracking-widest">{isVisual ? 'Visual Editor' : 'Source Code'}</span>
          {pasteAsText && <span className="text-blue-600 font-black uppercase tracking-widest">Paste as Text Active</span>}
        </div>
        <div className="flex items-center gap-1 uppercase tracking-widest">
          <span>Words: {wordCount}</span>
        </div>
      </div>
    </div >
  );
};

export default RichTextEditor;
