import React, { useMemo } from 'react'
import './ShopStats.css'

function ShopStats({ items, budget }) {
  const stats = useMemo(() => {
    const total = items.length
    const pending = items.filter(i => !i.purchased).length
    const purchased = items.filter(i => i.purchased).length
    
    const totalCost = items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0)
    const spent = items
      .filter(i => i.purchased)
      .reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0)
    const remaining = budget - spent
    
    // By category
    const byCategory = items.reduce((acc, item) => {
      const cat = item.category || 'Otros'
      if (!acc[cat]) acc[cat] = { count: 0, cost: 0, spent: 0 }
      acc[cat].count++
      acc[cat].cost += (item.price || 0) * (item.quantity || 1)
      if (item.purchased) acc[cat].spent += (item.price || 0) * (item.quantity || 1)
      return acc
    }, {})
    
    // By priority
    const byPriority = items.reduce((acc, item) => {
      const pri = item.priority || 'normal'
      if (!acc[pri]) acc[pri] = { count: 0, purchased: 0 }
      acc[pri].count++
      if (item.purchased) acc[pri].purchased++
      return acc
    }, {})
    
    // Recent activity (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentPurchases = items.filter(i => {
      if (!i.purchased || !i.datePurchased) return false
      return new Date(i.datePurchased) >= weekAgo
    }).length
    
    // Average item price
    const itemsWithPrice = items.filter(i => i.price > 0)
    const avgPrice = itemsWithPrice.length > 0
      ? itemsWithPrice.reduce((sum, i) => sum + i.price, 0) / itemsWithPrice.length
      : 0
    
    return {
      total,
      pending,
      purchased,
      totalCost,
      spent,
      remaining,
      budgetPercent: budget > 0 ? Math.round((spent / budget) * 100) : 0,
      byCategory,
      byPriority,
      recentPurchases,
      avgPrice: Math.round(avgPrice * 100) / 100
    }
  }, [items, budget])

  const categoryColors = {
    'Alimentos': '#10B981',
    'Electrónica': '#3B82F6',
    'Hogar': '#F59E0B',
    'Ropa': '#EC4899',
    'Salud': '#EF4444',
    'Entretenimiento': '#8B5CF6',
    'Transporte': '#06B6D4',
    'Otros': '#6B7280'
  }

  const priorityOrder = ['critical', 'high', 'medium', 'low', 'normal']
  const priorityLabels = {
    critical: '🔥 Crítica',
    high: '⚡ Alta',
    medium: '📌 Media',
    low: '🌱 Baja',
    normal: '⏳ Normal'
  }
  const priorityColors = {
    critical: '#EF4444',
    high: '#F59E0B',
    medium: '#3B82F6',
    low: '#10B981',
    normal: '#6B7280'
  }

  const getBudgetStatus = () => {
    if (stats.budgetPercent < 50) return { label: '✅ On Track', color: '#10B981' }
    if (stats.budgetPercent < 80) return { label: '⚠️ Cuidado', color: '#F59E0B' }
    if (stats.budgetPercent < 100) return { label: '🔴 Límite', color: '#EF4444' }
    return { label: '❌ Excedido', color: '#DC2626' }
  }

  const budgetStatus = getBudgetStatus()

  return (
    <div className="shop-stats-widget">
      <h3>📊 Análisis de Compras</h3>

      {/* Main Stats */}
      <div className="stats-overview">
        <div className="stat-card budget-card">
          <div className="budget-header">
            <span className="stat-label">Presupuesto</span>
            <span className="budget-status" style={{ color: budgetStatus.color }}>
              {budgetStatus.label}
            </span>
          </div>
          <div className="budget-bar">
            <div 
              className="budget-fill" 
              style={{ 
                width: `${Math.min(stats.budgetPercent, 100)}%`,
                background: budgetStatus.color
              }}
            />
          </div>
          <div className="budget-numbers">
            <span className="spent">${stats.spent.toFixed(2)} gastado</span>
            <span className="percent">{stats.budgetPercent}%</span>
          </div>
          <div className="budget-remaining">
            ${stats.remaining.toFixed(2)} disponible de ${budget.toFixed(2)}
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-mini">
            <span className="mini-number">{stats.total}</span>
            <span className="mini-label">Total items</span>
          </div>
          <div className="stat-mini">
            <span className="mini-number purchased">{stats.purchased}</span>
            <span className="mini-label">Comprados</span>
          </div>
          <div className="stat-mini">
            <span className="mini-number pending">{stats.pending}</span>
            <span className="mini-label">Pendientes</span>
          </div>
        </div>
      </div>

      {/* Cost Summary */}
      <div className="cost-summary">
        <div className="cost-item">
          <span className="cost-icon">💰</span>
          <div className="cost-info">
            <span className="cost-label">Costo Total Estimado</span>
            <span className="cost-value">${stats.totalCost.toFixed(2)}</span>
          </div>
        </div>
        <div className="cost-item">
          <span className="cost-icon">✅</span>
          <div className="cost-info">
            <span className="cost-label">Ya Gastado</span>
            <span className="cost-value spent">${stats.spent.toFixed(2)}</span>
          </div>
        </div>
        <div className="cost-item">
          <span className="cost-icon">📊</span>
          <div className="cost-info">
            <span className="cost-label">Precio Promedio</span>
            <span className="cost-value">${stats.avgPrice}</span>
          </div>
        </div>
      </div>

      {/* By Category */}
      {Object.keys(stats.byCategory).length > 0 && (
        <div className="category-breakdown">
          <h4>📁 Por Categoría</h4>
          <div className="category-list">
            {Object.entries(stats.byCategory)
              .sort((a, b) => b[1].cost - a[1].cost)
              .map(([cat, data]) => (
                <div key={cat} className="category-item">
                  <div 
                    className="category-bar"
                    style={{ 
                      background: categoryColors[cat] || '#6B7280',
                      width: `${Math.min((data.cost / stats.totalCost) * 100, 100)}%`
                    }}
                  />
                  <div className="category-info">
                    <span className="category-name">{cat}</span>
                    <div className="category-numbers">
                      <span>{data.count} items</span>
                      <span className="category-cost">${data.cost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* By Priority */}
      <div className="priority-breakdown">
        <h4>🎯 Por Prioridad</h4>
        <div className="priority-bars">
          {priorityOrder
            .filter(p => stats.byPriority[p])
            .map(priority => {
              const data = stats.byPriority[priority]
              const percent = data.count > 0 ? (data.purchased / data.count) * 100 : 0
              return (
                <div key={priority} className="priority-item">
                  <div className="priority-header">
                    <span className="priority-label" style={{ color: priorityColors[priority] }}>
                      {priorityLabels[priority]}
                    </span>
                    <span className="priority-count">
                      {data.purchased}/{data.count}
                    </span>
                  </div>
                  <div className="priority-progress">
                    <div 
                      className="priority-fill"
                      style={{ 
                        width: `${percent}%`,
                        background: priorityColors[priority]
                      }}
                    />
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* Activity */}
      <div className="activity-section">
        <h4>📈 Actividad Reciente</h4>
        <div className="activity-stats">
          <div className="activity-item">
            <span className="activity-icon">🛒</span>
            <div className="activity-info">
              <span className="activity-value">{stats.recentPurchases}</span>
              <span className="activity-label">compras esta semana</span>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">📦</span>
            <div className="activity-info">
              <span className="activity-value">{stats.purchased}</span>
              <span className="activity-label">de {stats.total} completado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Card */}
      <div className="shop-motivational-card">
        {stats.pending === 0 ? (
          <>
            <span className="motiv-emoji">🎉</span>
            <p>¡Lista completada! Todas las compras realizadas.</p>
          </>
        ) : stats.budgetPercent > 100 ? (
          <>
            <span className="motiv-emoji">⚠️</span>
            <p>Has excedido el presupuesto. Considera priorizar items.</p>
          </>
        ) : stats.budgetPercent > 80 ? (
          <>
            <span className="motiv-emoji">💡</span>
            <p>Estás cerca del límite. ${stats.remaining.toFixed(2)} restantes.</p>
          </>
        ) : (
          <>
            <span className="motiv-emoji">💪</span>
            <p>¡Vas bien! Tienes ${stats.remaining.toFixed(2)} disponibles.</p>
          </>
        )}
      </div>
    </div>
  )
}

export default ShopStats
