import { FoodItem, Recipe } from '../types';

const IMAGE = 'https://images.unsplash.com/photo-1547592180-85f173990554?w=900&auto=format&fit=crop&q=80';

// Turkish home-cooking catalog. Values are practical per-serving estimates; exact calories vary with recipe, oil and portion.
export const TURKISH_HOME_FOODS: FoodItem[] = [
  { id:'tr-home-pilav', name:'Pirinç Pilavı (Ev Yapımı)', category:'Türk Ev Yemekleri', calories:190, protein:3.5, carbs:34, fat:5.2, fiber:0.7, defaultServing:1, unit:'porsiyon (180g)', healthScore:78, pros:['Doyurucu','Kolay hazırlanır'], cons:['Porsiyon kontrolü'], barcode:'' },
  { id:'tr-home-bulgur-pilav', name:'Bulgur Pilavı (Domatesli)', category:'Türk Ev Yemekleri', calories:175, protein:5.2, carbs:31, fat:4.2, fiber:5.2, defaultServing:1, unit:'porsiyon (180g)', healthScore:88, pros:['Lif içerir','Ev yemeği'], cons:['Yağ miktarına bağlı'], barcode:'' },
  { id:'tr-home-kuru-fasulye', name:'Kuru Fasulye (Ev Yapımı)', category:'Türk Ev Yemekleri', calories:245, protein:14, carbs:32, fat:7, fiber:9, defaultServing:1, unit:'porsiyon (200g)', healthScore:91, pros:['Bitkisel protein','Lif zengini'], cons:['Yağ miktarına bağlı'], barcode:'' },
  { id:'tr-home-taze-fasulye', name:'Zeytinyağlı Taze Fasulye (Ev Yapımı)', category:'Türk Ev Yemekleri', calories:155, protein:4, carbs:15, fat:9, fiber:6, defaultServing:1, unit:'porsiyon (220g)', healthScore:92, pros:['Sebze ağırlıklı','Lif zengini'], cons:['Zeytinyağı porsiyonu önemli'], barcode:'' },
  { id:'tr-home-nohut', name:'Nohut Yemeği (Ev Yapımı)', category:'Türk Ev Yemekleri', calories:260, protein:13, carbs:35, fat:7, fiber:9, defaultServing:1, unit:'porsiyon (200g)', healthScore:90, pros:['Bitkisel protein','Lif zengini'], cons:['Porsiyon kontrolü'], barcode:'' },
  { id:'tr-home-mercimek', name:'Mercimek Yemeği (Ev Yapımı)', category:'Türk Ev Yemekleri', calories:225, protein:14, carbs:32, fat:4.5, fiber:10, defaultServing:1, unit:'porsiyon (220g)', healthScore:94, pros:['Protein ve lif','Doyurucu'], cons:[], barcode:'' },
  { id:'tr-home-imambayildi', name:'İmam Bayıldı', category:'Türk Ev Yemekleri', calories:210, protein:3, carbs:16, fat:15, fiber:6, defaultServing:1, unit:'porsiyon (200g)', healthScore:86, pros:['Sebze içerir'], cons:['Yağ miktarı değişebilir'], barcode:'' },
  { id:'tr-home-karnıyarık', name:'Karnıyarık', category:'Türk Ev Yemekleri', calories:330, protein:18, carbs:15, fat:23, fiber:5, defaultServing:1, unit:'adet (200g)', healthScore:76, pros:['Protein içerir','Geleneksel ev yemeği'], cons:['Yağ ve porsiyon kontrolü'], barcode:'' },
  { id:'tr-home-türlü', name:'Sebzeli Türlü (Ev Yapımı)', category:'Türk Ev Yemekleri', calories:180, protein:5, carbs:22, fat:8, fiber:7, defaultServing:1, unit:'porsiyon (250g)', healthScore:93, pros:['Sebze çeşitliliği','Lif zengini'], cons:['Yağ miktarına bağlı'], barcode:'' },
  { id:'tr-home-musakka', name:'Patlıcan Musakka', category:'Türk Ev Yemekleri', calories:315, protein:17, carbs:18, fat:21, fiber:6, defaultServing:1, unit:'porsiyon (220g)', healthScore:78, pros:['Protein ve sebze'], cons:['Yağ miktarı yüksek olabilir'], barcode:'' },
  { id:'tr-home-etli-bamya', name:'Etli Bamya', category:'Türk Ev Yemekleri', calories:235, protein:20, carbs:14, fat:11, fiber:6, defaultServing:1, unit:'porsiyon (220g)', healthScore:90, pros:['Protein','Sebze ve lif'], cons:['Et ve yağ miktarına bağlı'], barcode:'' },
  { id:'tr-home-yaprak-sarma', name:'Zeytinyağlı Yaprak Sarma', category:'Türk Ev Yemekleri', calories:210, protein:4, carbs:28, fat:9, fiber:4, defaultServing:6, unit:'adet', healthScore:85, pros:['Geleneksel','Porsiyonlanabilir'], cons:['Pirinç ve yağ içerir'], barcode:'' },
  { id:'tr-home-dolma', name:'Biber Dolması (Etli)', category:'Türk Ev Yemekleri', calories:285, protein:16, carbs:24, fat:13, fiber:4, defaultServing:2, unit:'adet', healthScore:83, pros:['Protein içerir','Sebze içerir'], cons:['Porsiyon kontrolü'], barcode:'' },
  { id:'tr-home-tavuk-sote', name:'Tavuk Sote (Ev Yapımı)', category:'Türk Ev Yemekleri', calories:290, protein:35, carbs:12, fat:11, fiber:3, defaultServing:1, unit:'porsiyon (220g)', healthScore:92, pros:['Yüksek protein','Sebzeli'], cons:['Yağ miktarına bağlı'], barcode:'' },
  { id:'tr-home-et-sote', name:'Et Sote (Ev Yapımı)', category:'Türk Ev Yemekleri', calories:340, protein:31, carbs:12, fat:19, fiber:3, defaultServing:1, unit:'porsiyon (220g)', healthScore:86, pros:['Yüksek protein','Doyurucu'], cons:['Yağ miktarı değişebilir'], barcode:'' },
  { id:'tr-home-manti', name:'Mantı (Yoğurtlu)', category:'Türk Ev Yemekleri', calories:420, protein:19, carbs:48, fat:18, fiber:3, defaultServing:1, unit:'porsiyon (250g)', healthScore:72, pros:['Doyurucu','Geleneksel'], cons:['Enerji yoğun'], barcode:'' },
  { id:'tr-home-kofte', name:'Izgara Köfte (Ev Yapımı)', category:'Türk Ev Yemekleri', calories:330, protein:27, carbs:8, fat:21, fiber:1, defaultServing:4, unit:'adet (160g)', healthScore:80, pros:['Protein zengini'], cons:['Yağ miktarına bağlı'], barcode:'' },
  { id:'tr-home-sucuklu-yumurta', name:'Sucuklu Yumurta', category:'Kahvaltılıklar', calories:410, protein:23, carbs:3, fat:34, fiber:0, defaultServing:1, unit:'porsiyon (180g)', healthScore:58, pros:['Protein içerir','Geleneksel kahvaltı'], cons:['Yağ ve tuz yüksek olabilir'], barcode:'' },
  { id:'tr-home-peynirli-yumurta', name:'Peynirli Yumurta', category:'Kahvaltılıklar', calories:300, protein:22, carbs:2, fat:23, fiber:0, defaultServing:1, unit:'porsiyon (160g)', healthScore:72, pros:['Protein ve kalsiyum'], cons:['Peynir türüne göre yağ değişir'], barcode:'' },
  { id:'tr-home-kasarli-yumurta', name:'Kaşarlı Yumurta', category:'Kahvaltılıklar', calories:320, protein:24, carbs:2, fat:25, fiber:0, defaultServing:1, unit:'porsiyon (160g)', healthScore:70, pros:['Protein','Pratik'], cons:['Yağ ve tuz değişebilir'], barcode:'' },
  { id:'tr-home-menemen', name:'Menemen', category:'Kahvaltılıklar', calories:220, protein:12, carbs:12, fat:14, fiber:3, defaultServing:1, unit:'porsiyon (220g)', healthScore:88, pros:['Sebze içerir','Protein'], cons:['Yağ miktarına bağlı'], barcode:'' },
  { id:'tr-home-sucuklu-menemen', name:'Sucuklu Menemen', category:'Kahvaltılıklar', calories:360, protein:20, carbs:12, fat:27, fiber:3, defaultServing:1, unit:'porsiyon (230g)', healthScore:65, pros:['Doyurucu','Geleneksel'], cons:['Yağ ve tuz yüksek olabilir'], barcode:'' },
  { id:'tr-home-mihlama', name:'Mıhlama (Kuymak)', category:'Karadeniz Mutfağı', calories:430, protein:18, carbs:12, fat:35, fiber:0, defaultServing:1, unit:'porsiyon (180g)', healthScore:62, pros:['Geleneksel Karadeniz yemeği','Doyurucu'], cons:['Yağ ve peynir nedeniyle enerji yoğun'], barcode:'' },
  { id:'tr-home-kavurmali-yumurta', name:'Kavurmalı Yumurta', category:'Kahvaltılıklar', calories:390, protein:29, carbs:2, fat:30, fiber:0, defaultServing:1, unit:'porsiyon (180g)', healthScore:64, pros:['Protein','Doyurucu'], cons:['Yağ ve tuz yüksek olabilir'], barcode:'' },
  { id:'tr-home-pastirmali-yumurta', name:'Pastırmalı Yumurta', category:'Kahvaltılıklar', calories:330, protein:28, carbs:2, fat:24, fiber:0, defaultServing:1, unit:'porsiyon (170g)', healthScore:66, pros:['Protein','Geleneksel'], cons:['Tuz yüksek olabilir'], barcode:'' },
  { id:'tr-home-sucuk', name:'Sucuk (Pişmiş)', category:'Kahvaltılıklar', calories:430, protein:22, carbs:2, fat:37, fiber:0, defaultServing:1, unit:'50g', healthScore:52, pros:['Protein'], cons:['Yağ ve tuz yüksek'], barcode:'' },
  { id:'tr-home-mercimek-corbasi', name:'Mercimek Çorbası (Ev Yapımı)', category:'Çorbalar', calories:155, protein:8, carbs:22, fat:4.5, fiber:6, defaultServing:1, unit:'kase (250ml)', healthScore:94, pros:['Lif ve bitkisel protein','Doyurucu'], cons:[], barcode:'' },
  { id:'tr-home-yayla-corbasi', name:'Yayla Çorbası', category:'Çorbalar', calories:145, protein:6, carbs:18, fat:5.5, fiber:1, defaultServing:1, unit:'kase (250ml)', healthScore:87, pros:['Yoğurt içerir','Hafif öğün'], cons:['Porsiyon ve yağ kontrolü'], barcode:'' },
  { id:'tr-home-tarhana', name:'Tarhana Çorbası', category:'Çorbalar', calories:135, protein:5, carbs:20, fat:4, fiber:3, defaultServing:1, unit:'kase (250ml)', healthScore:89, pros:['Geleneksel','Doyurucu'], cons:['Tuz miktarı değişebilir'], barcode:'' }
];

export const TURKISH_HOME_RECIPES: Recipe[] = TURKISH_HOME_FOODS.map((food): Recipe => ({
  id: `recipe-${food.id}`,
  title: food.name,
  category: food.category === 'Çorbalar' || food.category === 'Kahvaltılıklar' || food.category === 'Karadeniz Mutfağı' ? 'breakfast' : 'lunch',
  calories: food.calories,
  carbs: food.carbs,
  protein: food.protein,
  fat: food.fat,
  prepTimeMinutes: 45,
  difficulty: 'Kolay',
  servings: 4,
  tags: ['Türk Mutfağı', 'Ev Yemeği', food.category],
  ingredients: [{ name: 'Ev yapımı tarif', amount: food.unit }],
  steps: ['Malzemeleri hazırlayın.', 'Ev usulü pişirin.', 'Porsiyonu ölçerek servis edin.'],
  imageUrl: IMAGE,
  proFeature: false,
}));
