import { FoodItem, Recipe } from '../types';

const IMAGE = 'https://images.unsplash.com/photo-1547592180-85f173990554?w=900&auto=format&fit=crop&q=80';

// Batch 1: common Turkish home, bakery and meze foods. Nutrition is an approximate practical serving estimate.
export const TURKISH_TRADITIONAL_BATCH_1: FoodItem[] = [
  { id:'tr-kisir', name:'Kısır', category:'Mezeler ve Salatalar', calories:210, protein:5, carbs:31, fat:7, fiber:6, defaultServing:1, unit:'porsiyon (180g)', healthScore:88, pros:['Bulgur ve lif içerir','Doyurucu'], cons:['Yağ miktarı değişebilir'], barcode:'' },
  { id:'tr-kol-boregi', name:'Kol Böreği', category:'Hamur İşleri', calories:390, protein:9, carbs:34, fat:24, fiber:2, defaultServing:1, unit:'dilim (120g)', healthScore:62, pros:['Geleneksel','Doyurucu'], cons:['Enerji ve yağ yoğun'], barcode:'' },
  { id:'tr-su-boregi', name:'Su Böreği', category:'Hamur İşleri', calories:330, protein:9, carbs:29, fat:20, fiber:1, defaultServing:1, unit:'dilim (120g)', healthScore:65, pros:['Geleneksel','Protein içerir'], cons:['Yağ ve enerji yoğun'], barcode:'' },
  { id:'tr-peynirli-borek', name:'Peynirli Börek', category:'Hamur İşleri', calories:315, protein:9, carbs:30, fat:18, fiber:2, defaultServing:1, unit:'dilim (110g)', healthScore:67, pros:['Pratik','Protein içerir'], cons:['Yağ ve tuz değişebilir'], barcode:'' },
  { id:'tr-sigara-boregi', name:'Sigara Böreği', category:'Hamur İşleri', calories:280, protein:8, carbs:24, fat:17, fiber:1, defaultServing:3, unit:'adet (90g)', healthScore:60, pros:['Atıştırmalık','Porsiyonlanabilir'], cons:['Kızartma nedeniyle enerji yoğun'], barcode:'' },
  { id:'tr-gozleme-peynirli', name:'Peynirli Gözleme', category:'Hamur İşleri', calories:420, protein:15, carbs:45, fat:21, fiber:3, defaultServing:1, unit:'adet (180g)', healthScore:68, pros:['Doyurucu','Protein içerir'], cons:['Yağ ve hamur porsiyonu önemli'], barcode:'' },
  { id:'tr-gozleme-patatesli', name:'Patatesli Gözleme', category:'Hamur İşleri', calories:400, protein:9, carbs:55, fat:16, fiber:5, defaultServing:1, unit:'adet (180g)', healthScore:70, pros:['Doyurucu','Patates ve hamur'], cons:['Porsiyon kontrolü'], barcode:'' },
  { id:'tr-lahmacun', name:'Lahmacun', category:'Pide ve Lahmacun', calories:300, protein:15, carbs:36, fat:11, fiber:3, defaultServing:1, unit:'adet (150g)', healthScore:74, pros:['Protein içerir','İnce hamurlu'], cons:['Tuz ve yağ değişebilir'], barcode:'' },
  { id:'tr-kasarli-pide', name:'Kaşarlı Pide', category:'Pide ve Lahmacun', calories:520, protein:22, carbs:58, fat:23, fiber:3, defaultServing:1, unit:'yarım (200g)', healthScore:65, pros:['Protein ve kalsiyum'], cons:['Enerji yoğun'], barcode:'' },
  { id:'tr-kiymali-pide', name:'Kıymalı Pide', category:'Pide ve Lahmacun', calories:470, protein:24, carbs:53, fat:18, fiber:3, defaultServing:1, unit:'yarım (200g)', healthScore:68, pros:['Protein içerir','Doyurucu'], cons:['Hamur ve yağ miktarı önemli'], barcode:'' },
  { id:'tr-barbunya', name:'Barbunya Pilaki', category:'Zeytinyağlılar', calories:230, protein:9, carbs:30, fat:8, fiber:9, defaultServing:1, unit:'porsiyon (200g)', healthScore:92, pros:['Lif zengini','Bitkisel protein'], cons:['Yağ miktarı değişebilir'], barcode:'' },
  { id:'tr-patates-yemegi', name:'Etli Patates Yemeği', category:'Türk Ev Yemekleri', calories:290, protein:18, carbs:27, fat:12, fiber:4, defaultServing:1, unit:'porsiyon (250g)', healthScore:82, pros:['Ev yemeği','Doyurucu'], cons:['Yağ miktarına bağlı'], barcode:'' },
  { id:'tr-bezelye', name:'Etli Bezelye Yemeği', category:'Türk Ev Yemekleri', calories:270, protein:19, carbs:25, fat:11, fiber:6, defaultServing:1, unit:'porsiyon (250g)', healthScore:87, pros:['Protein','Sebze ve lif'], cons:['Yağ miktarına bağlı'], barcode:'' },
  { id:'tr-pirasa', name:'Zeytinyağlı Pırasa', category:'Zeytinyağlılar', calories:170, protein:3, carbs:19, fat:9, fiber:5, defaultServing:1, unit:'porsiyon (220g)', healthScore:91, pros:['Sebze ve lif'], cons:['Yağ porsiyonu önemli'], barcode:'' },
  { id:'tr-kabak-yemegi', name:'Zeytinyağlı Kabak Yemeği', category:'Zeytinyağlılar', calories:150, protein:4, carbs:13, fat:9, fiber:4, defaultServing:1, unit:'porsiyon (220g)', healthScore:93, pros:['Hafif','Sebze ağırlıklı'], cons:['Yağ miktarı değişebilir'], barcode:'' },
  { id:'tr-tas-kebabi', name:'Tas Kebabı', category:'Türk Ev Yemekleri', calories:360, protein:28, carbs:20, fat:19, fiber:4, defaultServing:1, unit:'porsiyon (250g)', healthScore:81, pros:['Protein zengini','Geleneksel'], cons:['Yağ miktarı değişebilir'], barcode:'' },
  { id:'tr-hunkar-begendi', name:'Hünkar Beğendi', category:'Türk Ev Yemekleri', calories:430, protein:25, carbs:25, fat:26, fiber:5, defaultServing:1, unit:'porsiyon (280g)', healthScore:72, pros:['Protein','Geleneksel'], cons:['Enerji yoğun'], barcode:'' },
  { id:'tr-karnabahar-yemegi', name:'Karnabahar Yemeği', category:'Türk Ev Yemekleri', calories:190, protein:8, carbs:18, fat:9, fiber:6, defaultServing:1, unit:'porsiyon (250g)', healthScore:91, pros:['Sebze ve lif'], cons:['Yağ miktarına bağlı'], barcode:'' },
  { id:'tr-enginar', name:'Zeytinyağlı Enginar', category:'Zeytinyağlılar', calories:190, protein:5, carbs:25, fat:8, fiber:8, defaultServing:1, unit:'adet (220g)', healthScore:95, pros:['Lif zengini','Sebze ağırlıklı'], cons:['Zeytinyağı porsiyonu önemli'], barcode:'' },
  { id:'tr-mercimek-koftesi', name:'Mercimek Köftesi', category:'Mezeler ve Salatalar', calories:180, protein:7, carbs:28, fat:5, fiber:7, defaultServing:6, unit:'adet (150g)', healthScore:92, pros:['Bitkisel protein','Lif içerir'], cons:['Bulgur ve yağ miktarı değişebilir'], barcode:'' },
  { id:'tr-cacik', name:'Cacık', category:'Mezeler ve Salatalar', calories:75, protein:5, carbs:6, fat:3, fiber:1, defaultServing:1, unit:'kase (200g)', healthScore:94, pros:['Yoğurt ve protein','Ferahlık'], cons:['Tuz miktarı değişebilir'], barcode:'' },
];

export const TURKISH_TRADITIONAL_BATCH_1_RECIPES: Recipe[] = TURKISH_TRADITIONAL_BATCH_1.map((food): Recipe => ({
  id:`recipe-${food.id}`,
  title:food.name,
  category:food.category === 'Hamur İşleri' || food.category === 'Pide ve Lahmacun' ? 'lunch' : food.category === 'Mezeler ve Salatalar' || food.category === 'Zeytinyağlılar' ? 'lunch' : 'dinner',
  calories:food.calories,
  carbs:food.carbs,
  protein:food.protein,
  fat:food.fat,
  prepTimeMinutes:45,
  difficulty:'Kolay',
  servings:4,
  tags:['Türk Mutfağı', food.category],
  ingredients:[{name:'Geleneksel ev malzemeleri', amount:food.unit}],
  steps:['Malzemeleri hazırlayın.','Geleneksel usule uygun pişirin veya hazırlayın.','Porsiyonu ölçerek servis edin.'],
  imageUrl:IMAGE,
  proFeature:false,
}));
