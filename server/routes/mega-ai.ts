import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { generateMegaAIReport, generateUltraMegaAIReport } from '../ai/mega-manager';

const router = Router();

router.use(authenticate);

/**
 * MEGA AI REPORT - Barcha AI tahlillarni birlashtiradi
 */
router.get('/report', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    
    console.log(`🚀 MEGA AI Report so'raldi: ${days} kun`);
    
    const report = await generateMegaAIReport(days);
    
    res.json(report);
  } catch (error) {
    console.error('MEGA AI Report xatolik:', error);
    res.status(500).json({ 
      error: 'MEGA AI Report yaratishda xatolik',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Quick Summary - Tezkor xulosa
 */
router.get('/summary', async (req, res) => {
  try {
    const report = await generateMegaAIReport(7); // 7 kunlik
    
    res.json({
      overallHealth: report.overallHealth,
      aiConfidence: report.aiConfidence,
      urgentActionsCount: report.urgentActions.length,
      criticalRisks: report.riskAssessment.risks.filter((r: any) => r.severity === 'high').length,
      totalRevenue: report.businessMetrics.totalRevenue,
      netProfit: report.businessMetrics.netProfit,
      executiveSummary: report.executiveSummary
    });
  } catch (error) {
    console.error('Summary xatolik:', error);
    res.status(500).json({ error: 'Summary yaratishda xatolik' });
  }
});

export default router;


/**
 * ULTRA MEGA AI REPORT - Yanada kuchliroq versiya
 * Machine Learning + Predictive Analytics + Automated Decisions
 */
router.get('/ultra-report', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    
    console.log(`🚀🚀🚀 ULTRA MEGA AI Report so'raldi: ${days} kun`);
    
    const report = await generateUltraMegaAIReport(days);
    
    res.json(report);
  } catch (error) {
    console.error('ULTRA MEGA AI Report xatolik:', error);
    res.status(500).json({ 
      error: 'ULTRA MEGA AI Report yaratishda xatolik',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * AI Predictions - Faqat bashoratlar
 */
router.get('/predictions', async (req, res) => {
  try {
    const report = await generateUltraMegaAIReport(30);
    
    res.json({
      mlPredictions: report.mlPredictions,
      forecasts: report.forecasts,
      patterns: report.patterns
    });
  } catch (error) {
    console.error('Predictions xatolik:', error);
    res.status(500).json({ error: 'Predictions yaratishda xatolik' });
  }
});

/**
 * Automated Decisions - Avtomatik qarorlar
 */
router.get('/automated-decisions', async (req, res) => {
  try {
    const report = await generateUltraMegaAIReport(7);
    
    res.json(report.automatedDecisions);
  } catch (error) {
    console.error('Automated Decisions xatolik:', error);
    res.status(500).json({ error: 'Automated Decisions yaratishda xatolik' });
  }
});

/**
 * Competitor Analysis - Raqobatchilar tahlili
 */
router.get('/competitor-analysis', async (req, res) => {
  try {
    const report = await generateUltraMegaAIReport(30);
    
    res.json(report.competitorAnalysis);
  } catch (error) {
    console.error('Competitor Analysis xatolik:', error);
    res.status(500).json({ error: 'Competitor Analysis yaratishda xatolik' });
  }
});
