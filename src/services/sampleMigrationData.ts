// Realistic sample data mimicking catalogo_2160.json and migracao_sucesso.csv
// for immediate 1-click testing and demonstration

export const SAMPLE_CATALOGO_2160_JSON = `[
  {
    "id": "leg-1001",
    "titulo": "DIGA-ME O TEU DESEJO",
    "categoria": "Doramas",
    "capa": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    "video_url": "https://antigo.cdn.com/videos/diga-me-o-teu-desejo-hd.mp4",
    "vimeo_id": "",
    "ano": 2023,
    "nota": 9.7,
    "em_alta": 1,
    "tipo_video": "serie",
    "video_provider": "bunny",
    "created_at": "2023-08-12T14:20:00Z"
  },
  {
    "id": "leg-1002",
    "titulo": "Rainha das Lágrimas",
    "categoria": "Doramas",
    "capa": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
    "video_url": "",
    "vimeo_id": "87654321",
    "ano": 2024,
    "nota": 9.9,
    "em_alta": 1,
    "tipo_video": "serie",
    "video_provider": "vimeo",
    "created_at": "2024-03-10T10:00:00Z"
  },
  {
    "id": "leg-1003",
    "titulo": "CÃES DE CAÇA",
    "categoria": "Séries",
    "capa": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
    "video_url": "https://antigo.cdn.com/videos/caes-de-caca-ep01.mp4",
    "vimeo_id": "",
    "ano": 2023,
    "nota": 9.6,
    "em_alta": 0,
    "tipo_video": "serie",
    "video_provider": "custom",
    "created_at": "2023-06-20T18:30:00Z"
  },
  {
    "id": "leg-1004",
    "titulo": "Amor sob o Luar da Primavera",
    "categoria": "Novelas",
    "capa": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=80",
    "video_url": "",
    "vimeo_id": "",
    "ano": 2024,
    "nota": 9.2,
    "em_alta": 0,
    "tipo_video": "novela",
    "video_provider": "unknown",
    "created_at": "2024-01-15T12:00:00Z"
  },
  {
    "id": "leg-1005",
    "titulo": "O Último Samurai de Kyoto",
    "categoria": "Filmes",
    "capa": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80",
    "video_url": "https://antigo.cdn.com/filmes/ultimo-samurai-kyoto.mp4",
    "vimeo_id": "",
    "ano": 2022,
    "nota": 9.5,
    "em_alta": 0,
    "tipo_video": "filme",
    "video_provider": "bunny",
    "created_at": "2022-11-05T09:15:00Z"
  },
  {
    "id": "leg-1006",
    "titulo": "Dorama Antigo Sem Bunny ID",
    "categoria": "Doramas",
    "capa": "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=500&auto=format&fit=crop&q=80",
    "video_url": "https://antigo.cdn.com/videos/nao-migrado-ainda.mp4",
    "vimeo_id": "",
    "ano": 2018,
    "nota": 8.5,
    "em_alta": 0,
    "tipo_video": "serie",
    "video_provider": "vimeo",
    "created_at": "2018-05-10T11:00:00Z"
  },
  {
    "id": "leg-1007",
    "titulo": "A Lenda dos Nove Mares",
    "categoria": "Animes Asiáticos",
    "capa": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80",
    "video_url": "https://antigo.cdn.com/animes/nove-mares.mp4",
    "vimeo_id": "",
    "ano": 2024,
    "nota": 9.4,
    "em_alta": 1,
    "tipo_video": "serie",
    "video_provider": "bunny",
    "created_at": "2024-02-28T16:40:00Z"
  }
]`;

export const SAMPLE_MIGRACAO_SUCESSO_CSV = `titulo,categoria,url_antiga,bunny_video_id,status,data
"DIGA-ME O TEU DESEJO","Doramas","https://antigo.cdn.com/videos/diga-me-o-teu-desejo-hd.mp4","bunny-diga-me-desejo-01","success","2024-04-10"
"Rainha das Lágrimas","Doramas","https://vimeo.com/87654321","bunny-queen-tears-vip-99","success","2024-04-11"
"Cães de Caça","Séries","https://antigo.cdn.com/videos/caes-de-caca-ep01.mp4","bunny-caes-caca-01","success","2024-04-12"
"Amor sob o Luar da Primavera","Novelas","","bunny-amor-luar-primavera","success","2024-04-13"
"O Último Samurai de Kyoto","Filmes","https://antigo.cdn.com/filmes/ultimo-samurai-kyoto.mp4","bunny-samurai-kyoto-film","success","2024-04-14"
"A Lenda dos Nove Mares","Animes Asiáticos","https://antigo.cdn.com/animes/nove-mares.mp4","bunny-nove-mares-01","success","2024-04-15"
`;
