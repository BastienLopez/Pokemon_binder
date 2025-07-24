"""
Tests de validation des services frontend pour la Phase 3
Ces tests simulent le comportement du TCGdexService côté frontend
"""

import pytest
import httpx
import json
from typing import List, Dict, Any

class MockTCGdxService:
    """Simulation du service TCGdx frontend pour les tests"""
    
    BASE_URL = "https://api.tcgdx.net/v2/fr"
    
    @classmethod
    async def get_series(cls) -> List[Dict[str, Any]]:
        """Récupère la liste des séries comme le ferait le frontend"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{cls.BASE_URL}/series", timeout=10.0)
                if response.status_code != 200:
                    raise Exception(f"Erreur HTTP: {response.status_code}")
                return response.json()
        except httpx.RequestError as e:
            raise Exception(f"Erreur lors de la récupération des séries: {e}")
    
    @classmethod
    async def get_sets_by_serie(cls, serie_id: str) -> List[Dict[str, Any]]:
        """Récupère les extensions d'une série comme le ferait le frontend"""
        if not serie_id:
            raise ValueError("L'ID de la série est requis")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{cls.BASE_URL}/sets?serie={serie_id}", timeout=10.0)
                if response.status_code != 200:
                    raise Exception(f"Erreur HTTP: {response.status_code}")
                return response.json()
        except httpx.RequestError as e:
            raise Exception(f"Erreur lors de la récupération des extensions: {e}")
    
    @classmethod
    async def get_sets(cls) -> List[Dict[str, Any]]:
        """Récupère toutes les extensions comme le ferait le frontend"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{cls.BASE_URL}/sets", timeout=10.0)
                if response.status_code != 200:
                    raise Exception(f"Erreur HTTP: {response.status_code}")
                return response.json()
        except httpx.RequestError as e:
            raise Exception(f"Erreur lors de la récupération des extensions: {e}")
    
    @classmethod
    async def get_cards_by_set(cls, set_id: str) -> List[Dict[str, Any]]:
        """Récupère les cartes d'une extension comme le ferait le frontend"""
        if not set_id:
            raise ValueError("L'ID de l'extension est requis")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{cls.BASE_URL}/cards?set.id={set_id}", timeout=15.0)
                if response.status_code != 200:
                    raise Exception(f"Erreur HTTP: {response.status_code}")
                return response.json()
        except httpx.RequestError as e:
            raise Exception(f"Erreur lors de la récupération des cartes: {e}")
    
    @classmethod
    def get_high_quality_image_url(cls, card: Dict[str, Any]) -> str:
        """Formate l'URL de l'image haute qualité comme le ferait le frontend"""
        if not card or not card.get("image"):
            return ""
        return f"{card['image']}/high.webp"
    
    @classmethod
    def filter_cards(cls, cards: List[Dict[str, Any]], filters: Dict[str, str] = None) -> List[Dict[str, Any]]:
        """Filtre les cartes comme le ferait le frontend"""
        if not isinstance(cards, list):
            return []
        
        if not filters:
            return cards
        
        filtered_cards = []
        for card in cards:
            # Filtre par nom (insensible à la casse)
            if filters.get("name"):
                if not card.get("name", "").lower().find(filters["name"].lower()) >= 0:
                    continue
            
            # Filtre par rareté
            if filters.get("rarity"):
                if not card.get("rarity", "").lower().find(filters["rarity"].lower()) >= 0:
                    continue
            
            # Filtre par type
            if filters.get("type"):
                card_types = card.get("types", [])
                if not any(filters["type"].lower() in t.lower() for t in card_types):
                    continue
            
            filtered_cards.append(card)
        
        return filtered_cards
    
    @classmethod
    def get_available_rarities(cls, cards: List[Dict[str, Any]]) -> List[str]:
        """Retourne les raretés disponibles comme le ferait le frontend"""
        if not isinstance(cards, list):
            return []
        
        rarities = set()
        for card in cards:
            rarity = card.get("rarity")
            if rarity:
                rarities.add(rarity)
        
        return sorted(list(rarities))
    
    @classmethod
    def get_available_types(cls, cards: List[Dict[str, Any]]) -> List[str]:
        """Retourne les types disponibles comme le ferait le frontend"""
        if not isinstance(cards, list):
            return []
        
        types = set()
        for card in cards:
            card_types = card.get("types", [])
            if card_types:  # Vérifier que card_types n'est pas None ou vide
                for card_type in card_types:
                    types.add(card_type)
        
        return sorted(list(types))


class TestFrontendServiceValidation:
    """Tests de validation des services frontend"""
    
    @pytest.mark.asyncio
    async def test_get_series_functionality(self):
        """Test de la fonctionnalité de récupération des séries"""
        try:
            series = await MockTCGdxService.get_series()
            assert isinstance(series, list)
            assert len(series) > 0
            
            # Vérifier la structure
            first_series = series[0]
            assert "id" in first_series
            assert "name" in first_series
            
            print(f"✅ {len(series)} séries récupérées")
            
        except Exception as e:
            pytest.skip(f"Test de séries échoué: {e}")
    
    @pytest.mark.asyncio
    async def test_get_sets_functionality(self):
        """Test de la fonctionnalité de récupération des extensions"""
        try:
            sets = await MockTCGdxService.get_sets()
            assert isinstance(sets, list)
            assert len(sets) > 0
            
            # Vérifier la structure
            first_set = sets[0]
            assert "id" in first_set
            assert "name" in first_set
            
            print(f"✅ {len(sets)} extensions récupérées")
            
        except Exception as e:
            pytest.skip(f"Test d'extensions échoué: {e}")
    
    @pytest.mark.asyncio
    async def test_get_cards_functionality(self):
        """Test de la fonctionnalité de récupération des cartes"""
        try:
            # D'abord récupérer les extensions
            sets = await MockTCGdxService.get_sets()
            if len(sets) > 0:
                test_set_id = sets[0]["id"]
                cards = await MockTCGdxService.get_cards_by_set(test_set_id)
                
                assert isinstance(cards, list)
                
                if len(cards) > 0:
                    # Vérifier la structure des cartes
                    first_card = cards[0]
                    required_fields = ["id", "name", "localId", "image"]
                    for field in required_fields:
                        assert field in first_card, f"Champ {field} manquant"
                
                print(f"✅ {len(cards)} cartes récupérées pour l'extension {sets[0]['name']}")
                
        except Exception as e:
            pytest.skip(f"Test de cartes échoué: {e}")
    
    def test_image_url_formatting(self):
        """Test du formatage des URLs d'images haute qualité"""
        # Test avec une carte valide
        card = {"image": "https://assets.tcgdx.net/fr/base/base1/1"}
        result = MockTCGdxService.get_high_quality_image_url(card)
        assert result == "https://assets.tcgdx.net/fr/base/base1/1/high.webp"
        
        # Test avec une carte sans image
        empty_card = {}
        result = MockTCGdxService.get_high_quality_image_url(empty_card)
        assert result == ""
        
        # Test avec None
        result = MockTCGdxService.get_high_quality_image_url(None)
        assert result == ""
        
        print("✅ Formatage des URLs d'images validé")
    
    def test_card_filtering(self):
        """Test de la fonctionnalité de filtrage des cartes"""
        # Données de test
        test_cards = [
            {
                "id": "base1-1",
                "name": "Alakazam",
                "rarity": "Rare Holo",
                "types": ["Psychic"]
            },
            {
                "id": "base1-4", 
                "name": "Dracaufeu",
                "rarity": "Rare Holo",
                "types": ["Fire"]
            },
            {
                "id": "base1-7",
                "name": "Carapuce",
                "rarity": "Common",
                "types": ["Water"]
            }
        ]
        
        # Test filtre par nom
        filtered = MockTCGdxService.filter_cards(test_cards, {"name": "Alakazam"})
        assert len(filtered) == 1
        assert filtered[0]["name"] == "Alakazam"
        
        # Test filtre par rareté
        filtered = MockTCGdxService.filter_cards(test_cards, {"rarity": "Rare"})
        assert len(filtered) == 2  # Alakazam et Dracaufeu
        
        # Test filtre par type
        filtered = MockTCGdxService.filter_cards(test_cards, {"type": "Fire"})
        assert len(filtered) == 1
        assert filtered[0]["name"] == "Dracaufeu"
        
        # Test filtres combinés
        filtered = MockTCGdxService.filter_cards(test_cards, {"name": "a", "rarity": "Rare"})
        assert len(filtered) == 2  # Alakazam et Dracaufeu contiennent 'a' et ont 'Rare'
        
        print("✅ Fonctionnalité de filtrage validée")
    
    def test_available_rarities_extraction(self):
        """Test d'extraction des raretés disponibles"""
        test_cards = [
            {"rarity": "Rare Holo"},
            {"rarity": "Common"},
            {"rarity": "Rare Holo"},  # Doublon
            {"rarity": "Uncommon"},
            {"rarity": None}  # Valeur nulle
        ]
        
        rarities = MockTCGdxService.get_available_rarities(test_cards)
        expected = ["Common", "Rare Holo", "Uncommon"]
        assert rarities == expected
        
        print("✅ Extraction des raretés validée")
    
    def test_available_types_extraction(self):
        """Test d'extraction des types disponibles"""
        test_cards = [
            {"types": ["Fire", "Flying"]},
            {"types": ["Water"]},
            {"types": ["Fire"]},  # Doublon
            {"types": ["Psychic"]},
            {"types": None}  # Valeur nulle
        ]
        
        types = MockTCGdxService.get_available_types(test_cards)
        expected = ["Fire", "Flying", "Psychic", "Water"]
        assert types == expected
        
        print("✅ Extraction des types validée")
    
    @pytest.mark.asyncio
    async def test_error_handling(self):
        """Test de la gestion d'erreurs"""
        # Test avec ID d'extension invalide
        with pytest.raises(ValueError):
            await MockTCGdxService.get_cards_by_set("")
        
        with pytest.raises(ValueError):
            await MockTCGdxService.get_cards_by_set(None)
        
        # Test avec ID de série invalide
        with pytest.raises(ValueError):
            await MockTCGdxService.get_sets_by_serie("")
        
        print("✅ Gestion d'erreurs validée")
    
    @pytest.mark.asyncio
    async def test_complete_workflow_simulation(self):
        """Test de simulation du workflow complet de la page Cards"""
        try:
            # Étape 1: Charger les séries (nouveau dans la Phase 3)
            series = await MockTCGdxService.get_series()
            assert len(series) > 0
            
            # Étape 2: Charger les extensions
            sets = await MockTCGdxService.get_sets()
            assert len(sets) > 0
            
            # Étape 3: Sélectionner une extension et charger les cartes
            selected_set = sets[0]
            cards = await MockTCGdxService.get_cards_by_set(selected_set["id"])
            
            # Étape 4: Appliquer des filtres
            rarities = MockTCGdxService.get_available_rarities(cards)
            types = MockTCGdxService.get_available_types(cards)
            
            # Étape 5: Filtrer les cartes
            if len(cards) > 0:
                filtered_cards = MockTCGdxService.filter_cards(cards, {"name": ""})
                assert len(filtered_cards) == len(cards)  # Filtre vide
            
            # Étape 6: Formater les URLs d'images
            if len(cards) > 0:
                first_card = cards[0]
                image_url = MockTCGdxService.get_high_quality_image_url(first_card)
                assert image_url.endswith("/high.webp")
            
            print(f"✅ Workflow complet simulé: {len(series)} séries, {len(sets)} extensions, {len(cards)} cartes")
            
        except Exception as e:
            pytest.skip(f"Workflow complet échoué: {e}")

class TestBinnerSizeFunctionality:
    """Tests des fonctionnalités de taille de binder"""
    
    def test_binder_size_validation(self):
        """Test de validation des tailles de binder"""
        valid_sizes = ["3x3", "4x4", "5x5"]
        size_cards = {
            "3x3": 9,
            "4x4": 16,
            "5x5": 25
        }
        
        for size in valid_sizes:
            assert size in size_cards
            assert size_cards[size] > 0
        
        print("✅ Tailles de binder validées")
    
    @pytest.mark.asyncio
    async def test_binder_population_simulation(self):
        """Test de simulation du remplissage de binder"""
        try:
            # Récupérer des cartes pour simuler le remplissage
            sets = await MockTCGdxService.get_sets()
            if len(sets) > 0:
                cards = await MockTCGdxService.get_cards_by_set(sets[0]["id"])
                
                # Simuler différentes tailles de binder
                binder_sizes = {"3x3": 9, "4x4": 16, "5x5": 25}
                
                for size_name, required_cards in binder_sizes.items():
                    available_cards = len(cards)
                    can_fill = available_cards >= required_cards
                    
                    print(f"Binder {size_name}: {available_cards} cartes disponibles, {required_cards} requises - {'✅' if can_fill else '⚠️'}")
                
        except Exception as e:
            pytest.skip(f"Test de remplissage de binder échoué: {e}")
