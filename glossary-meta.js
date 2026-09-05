/* 用語解説：略語の読み・英語表記・英語表記のカタカナ読み */
(() => {
  'use strict';
  const glossary = window.ST_DATA?.glossary;
  if (!glossary) return;

  const META = {
    "RTO": ["アール・ティー・オー","Recovery Time Objective","リカバリー・タイム・オブジェクティブ"],
    "RPO": ["アール・ピー・オー","Recovery Point Objective","リカバリー・ポイント・オブジェクティブ"],
    "SLA": ["エス・エル・エー","Service Level Agreement","サービス・レベル・アグリーメント"],
    "SLM": ["エス・エル・エム","Service Level Management","サービス・レベル・マネジメント"],
    "NPV": ["エヌ・ピー・ブイ","Net Present Value","ネット・プレゼント・バリュー"],
    "ROI": ["アール・オー・アイ","Return on Investment","リターン・オン・インベストメント"],
    "KPI": ["ケー・ピー・アイ","Key Performance Indicator","キー・パフォーマンス・インディケーター"],
    "CSF": ["シー・エス・エフ","Critical Success Factor","クリティカル・サクセス・ファクター"],
    "PoC": ["ピー・オー・シー（ポック）","Proof of Concept","プルーフ・オブ・コンセプト"],
    "BPR": ["ビー・ピー・アール","Business Process Reengineering","ビジネス・プロセス・リエンジニアリング"],
    "TOC": ["ティー・オー・シー","Theory of Constraints","セオリー・オブ・コンストレインツ"],
    "PPM": ["ピー・ピー・エム","Product Portfolio Management","プロダクト・ポートフォリオ・マネジメント"],
    "SWOT分析": ["スウォット分析","Strengths, Weaknesses, Opportunities, Threats","ストレングス・ウィークネス・オポチュニティーズ・スレッツ"],
    "WBS": ["ダブリュー・ビー・エス","Work Breakdown Structure","ワーク・ブレークダウン・ストラクチャー"],
    "EVM": ["イー・ブイ・エム","Earned Value Management","アーンド・バリュー・マネジメント"],
    "API": ["エー・ピー・アイ","Application Programming Interface","アプリケーション・プログラミング・インターフェース"],
    "KGI": ["ケー・ジー・アイ","Key Goal Indicator","キー・ゴール・インディケーター"],
    "PEST分析": ["ペスト分析","Politics, Economy, Society, Technology","ポリティクス・エコノミー・ソサエティ・テクノロジー"],
    "3C分析": ["スリー・シー分析","Customer, Competitor, Company","カスタマー・コンペティター・カンパニー"],
    "VRIO": ["ブリオ","Value, Rarity, Imitability, Organization","バリュー・レアリティ・イミタビリティ・オーガニゼーション"],
    "STP": ["エス・ティー・ピー","Segmentation, Targeting, Positioning","セグメンテーション・ターゲティング・ポジショニング"],
    "CRM": ["シー・アール・エム","Customer Relationship Management","カスタマー・リレーションシップ・マネジメント"],
    "SCM": ["エス・シー・エム","Supply Chain Management","サプライ・チェーン・マネジメント"],
    "ERP": ["イー・アール・ピー","Enterprise Resource Planning","エンタープライズ・リソース・プランニング"],
    "BI": ["ビー・アイ","Business Intelligence","ビジネス・インテリジェンス"],
    "DWH": ["ディー・ダブリュー・エイチ","Data Warehouse","データ・ウェアハウス"],
    "ETL": ["イー・ティー・エル","Extract, Transform, Load","エクストラクト・トランスフォーム・ロード"],
    "RPA": ["アール・ピー・エー","Robotic Process Automation","ロボティック・プロセス・オートメーション"],
    "SaaS": ["サース","Software as a Service","ソフトウェア・アズ・ア・サービス"],
    "PaaS": ["パース","Platform as a Service","プラットフォーム・アズ・ア・サービス"],
    "IaaS": ["イアース","Infrastructure as a Service","インフラストラクチャ・アズ・ア・サービス"],
    "TCO": ["ティー・シー・オー","Total Cost of Ownership","トータル・コスト・オブ・オーナーシップ"],
    "IRR": ["アイ・アール・アール","Internal Rate of Return","インターナル・レート・オブ・リターン"],
    "CAPEX": ["キャペックス","Capital Expenditure","キャピタル・エクスペンディチャー"],
    "OPEX": ["オペックス","Operating Expenditure","オペレーティング・エクスペンディチャー"],
    "RFI": ["アール・エフ・アイ","Request for Information","リクエスト・フォー・インフォメーション"],
    "RFP": ["アール・エフ・ピー","Request for Proposal","リクエスト・フォー・プロポーザル"],
    "BCP": ["ビー・シー・ピー","Business Continuity Plan","ビジネス・コンティニュイティ・プラン"],
    "BCM": ["ビー・シー・エム","Business Continuity Management","ビジネス・コンティニュイティ・マネジメント"],
    "MTBF": ["エム・ティー・ビー・エフ","Mean Time Between Failures","ミーン・タイム・ビトウィーン・フェイラーズ"],
    "MTTR": ["エム・ティー・ティー・アール","Mean Time To Repair","ミーン・タイム・トゥ・リペア"],
    "DNS": ["ディー・エヌ・エス","Domain Name System","ドメイン・ネーム・システム"],
    "DHCP": ["ディー・エイチ・シー・ピー","Dynamic Host Configuration Protocol","ダイナミック・ホスト・コンフィギュレーション・プロトコル"],
    "NAT": ["ナット","Network Address Translation","ネットワーク・アドレス・トランスレーション"],
    "VLAN": ["ブイ・ラン","Virtual Local Area Network","バーチャル・ローカル・エリア・ネットワーク"],
    "VPN": ["ブイ・ピー・エヌ","Virtual Private Network","バーチャル・プライベート・ネットワーク"],
    "TLS": ["ティー・エル・エス","Transport Layer Security","トランスポート・レイヤー・セキュリティ"],
    "IDS": ["アイ・ディー・エス","Intrusion Detection System","イントルージョン・ディテクション・システム"],
    "IPS": ["アイ・ピー・エス","Intrusion Prevention System","イントルージョン・プリベンション・システム"],
    "WAF": ["ワフ","Web Application Firewall","ウェブ・アプリケーション・ファイアウォール"],
    "CSIRT": ["シーサート","Computer Security Incident Response Team","コンピューター・セキュリティ・インシデント・レスポンス・チーム"],
    "ACID": ["アシッド","Atomicity, Consistency, Isolation, Durability","アトミシティ・コンシステンシー・アイソレーション・デュラビリティ"],
    "RAID": ["レイド","Redundant Array of Independent Disks","リダンダント・アレイ・オブ・インディペンデント・ディスクス"]
  };

  Object.entries(META).forEach(([term,[abbrRead,english,englishRead]]) => {
    if (!glossary[term]) return;
    glossary[term].abbrRead = abbrRead;
    glossary[term].english = english;
    glossary[term].englishRead = englishRead;
  });
})();
