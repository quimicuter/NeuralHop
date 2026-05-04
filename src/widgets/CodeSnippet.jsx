import React from 'react'
import './CodeSnippet.css'

// Seed data de snippets Python para Data Science
const DEFAULT_SNIPPETS = [
  {
    id: 'pandas-import',
    filename: 'data_import.py',
    language: 'python',
    code: `import pandas as pd
import numpy as np

# Cargar dataset
df = pd.read_csv('data.csv')
print(df.head())
print(df.describe())`
  },
  {
    id: 'matplotlib-viz',
    filename: 'visualization.py',
    language: 'python',
    code: `import matplotlib.pyplot as plt
import seaborn as sns

# Crear visualización
plt.figure(figsize=(10, 6))
sns.scatterplot(data=df, x='x', y='y', hue='category')
plt.title('Análisis de Datos')
plt.show()`
  }
]

function CodeSnippet({ entries, onAddSnippet, onSnippetClick }) {
  // Mapear entries de tipo 'code' o con code en metadata
  const codeEntries = entries?.filter(e => 
    e.type === 'code' || e.metadata?.code
  ) || []

  const snippets = codeEntries.length > 0
    ? codeEntries.map(entry => ({
        id: entry.id,
        filename: entry.metadata?.filename || 'snippet.py',
        language: entry.metadata?.language || 'python',
        code: entry.metadata?.code || entry.content
      }))
    : DEFAULT_SNIPPETS

  const renderHighlightedCode = (code) => {
    // Simple syntax highlighting para Python
    return code
      .replace(/(import|from|as|def|class|return|if|else|for|while|try|except)/g, '<span class="keyword">$1</span>')
      .replace(/(print|len|range|enumerate|zip|map|filter)/g, '<span class="function">$1</span>')
      .replace(/('.*?'|".*?")/g, '<span class="string">$1</span>')
      .replace(/(#.*$)/gm, '<span class="comment">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="number">$1</span>')
  }

  return (
    <div className="code-snippet-widget">
      <div className="snippet-header">
        <h3 className="snippet-title">🐍 Code Snippet</h3>
        <p className="snippet-subtitle">Repositorio de código Python</p>
      </div>

      <div className="snippet-list">
        {snippets.map(snippet => (
          <div 
            key={snippet.id} 
            className="snippet-card"
            onClick={() => onSnippetClick && onSnippetClick(snippet)}
            style={{ cursor: onSnippetClick ? 'pointer' : 'default' }}
          >
            <div className="snippet-header-bar">
              <span className="snippet-filename">📄 {snippet.filename}</span>
              <span className="snippet-language">{snippet.language}</span>
            </div>
            <pre 
              className="snippet-code"
              dangerouslySetInnerHTML={{ __html: renderHighlightedCode(snippet.code) }}
            />
          </div>
        ))}
      </div>

      {onAddSnippet && (
        <button 
          className="snippet-add-btn"
          onClick={onAddSnippet}
        >
          + Agregar snippet
        </button>
      )}
    </div>
  )
}

export default CodeSnippet
