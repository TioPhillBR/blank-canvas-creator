
INSERT INTO institutional_sections (title, content, icon, sort_order, is_active)
SELECT 'Sobre a Silverado', 'O Grupo Silverado é um ecossistema industrial sólido, construído com base em experiência, confiança e compromisso com a qualidade. Mais do que empresas, o grupo reúne pessoas, processos e marcas que atuam de forma integrada para entregar soluções completas ao mercado. Com atuação nas áreas de soluções industriais, blends minerais, cargas de alta performance e comercialização de metais, a Silverado se posiciona como referência em inovação e excelência no setor industrial brasileiro.', 'Building2', 0, true
WHERE NOT EXISTS (SELECT 1 FROM institutional_sections WHERE title = 'Sobre a Silverado');

INSERT INTO institutional_sections (title, content, icon, sort_order, is_active)
SELECT 'Missão', 'Desenvolver e fornecer soluções industriais de alta performance com foco em qualidade técnica, rendimento, redução de custos e eficiência nos processos produtivos de nossos clientes, promovendo relações duradouras baseadas em confiança e resultados.', 'Target', 1, true
WHERE NOT EXISTS (SELECT 1 FROM institutional_sections WHERE title = 'Missão');

INSERT INTO institutional_sections (title, content, icon, sort_order, is_active)
SELECT 'Visão', 'Ser reconhecida como a principal referência em soluções industriais e minerais no Brasil, expandindo nossa atuação com tecnologia, inovação e compromisso com a sustentabilidade e o desenvolvimento das comunidades onde atuamos.', 'Eye', 2, true
WHERE NOT EXISTS (SELECT 1 FROM institutional_sections WHERE title = 'Visão');

INSERT INTO institutional_sections (title, content, icon, sort_order, is_active)
SELECT 'Valores', E'- Qualidade e excelência em tudo o que fazemos\n- Inovação e tecnologia como pilares de crescimento\n- Compromisso com o cliente e com resultados\n- Ética, transparência e respeito nas relações\n- Valorização das pessoas e do trabalho em equipe\n- Responsabilidade ambiental e social', 'Heart', 3, true
WHERE NOT EXISTS (SELECT 1 FROM institutional_sections WHERE title = 'Valores');

INSERT INTO institutional_sections (title, content, icon, sort_order, is_active)
SELECT 'Contato', E'Telefone: (32) 9842-63662\nE-mail: contato@silveradogrupo.com.br\nLocalização: Minas Gerais, Brasil\nSite: https://www.silveradogrupo.com.br', 'Phone', 4, true
WHERE NOT EXISTS (SELECT 1 FROM institutional_sections WHERE title = 'Contato');
