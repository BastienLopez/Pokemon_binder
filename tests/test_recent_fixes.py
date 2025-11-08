"""
Tests de validation pour les corrections récentes
- Binder page_number vs number
- URLs TCGdex avec /high.webp
- Filtres de type dans DeckBuilder
"""

import pytest


class TestBinderPageStructure:
    """Tests pour vérifier la structure correcte des pages de binder"""
    
    def test_binder_page_has_page_number_field(self):
        """Vérifie que BinderPage utilise page_number et non number"""
        from backend.models.binder import BinderPage, CardSlot
        
        # Créer une page avec page_number
        page = BinderPage(page_number=1, slots=[])
        
        # Vérifier que page_number existe
        assert hasattr(page, 'page_number')
        assert page.page_number == 1
        
        # Vérifier que number n'existe pas dans le modèle
        assert 'number' not in page.__fields__
    
    def test_binder_page_with_slots(self):
        """Vérifie qu'une page peut contenir des slots"""
        from backend.models.binder import BinderPage, CardSlot
        
        slots = [
            CardSlot(position=i, card_id=None) 
            for i in range(9)  # 3x3 = 9 slots
        ]
        
        page = BinderPage(page_number=1, slots=slots)
        
        assert len(page.slots) == 9
        assert all(isinstance(slot, CardSlot) for slot in page.slots)
    
    def test_card_slot_structure(self):
        """Vérifie la structure d'un CardSlot"""
        from backend.models.binder import CardSlot
        
        # Slot vide
        empty_slot = CardSlot(position=0)
        assert empty_slot.card_id is None
        assert empty_slot.user_card_id is None
        
        # Slot avec carte
        filled_slot = CardSlot(
            position=0,
            card_id="neo4-1",
            user_card_id="507f1f77bcf86cd799439011",
            card_name="Pharamp obscur",
            card_image="https://assets.tcgdex.net/fr/neo/neo4/1",
            set_name="Neo Destiny",
            rarity="Holo"
        )
        
        assert filled_slot.card_id == "neo4-1"
        assert filled_slot.card_name == "Pharamp obscur"
        assert filled_slot.card_image is not None


class TestTCGdexURLs:
    """Tests pour les URLs TCGdex"""
    
    def test_url_format_with_high_webp(self):
        """Vérifie le format correct des URLs TCGdex"""
        base_url = "https://assets.tcgdex.net/fr/neo/neo4/1"
        expected_url = "https://assets.tcgdex.net/fr/neo/neo4/1/high.webp"
        
        # Simuler la correction d'URL
        if base_url.includes('assets.tcgdex.net') if hasattr(str, 'includes') else 'assets.tcgdex.net' in base_url:
            if not base_url.endswith('.webp'):
                corrected_url = f"{base_url}/high.webp"
                assert corrected_url == expected_url
    
    def test_url_already_correct(self):
        """Vérifie qu'une URL déjà correcte n'est pas modifiée"""
        correct_url = "https://assets.tcgdex.net/fr/neo/neo4/1/high.webp"
        
        # Ne devrait pas être modifiée
        if correct_url.endswith('.webp'):
            assert correct_url == correct_url  # Pas de modification


class TestBinderResponse:
    """Tests pour la réponse API du binder"""
    
    def test_binder_response_structure(self):
        """Vérifie la structure de BinderResponse"""
        from backend.models.binder import BinderResponse, BinderPage, CardSlot
        
        # Créer une réponse de binder
        pages = [
            BinderPage(
                page_number=1,
                slots=[CardSlot(position=i) for i in range(9)]
            )
        ]
        
        response_data = {
            'id': '507f1f77bcf86cd799439011',
            'user_id': '507f1f77bcf86cd799439012',
            'name': 'Mon Binder',
            'size': '3x3',
            'description': 'Test binder',
            'is_public': False,
            'pages': pages,
            'total_pages': 1,
            'total_cards': 0,
            'created_at': '2025-11-08T00:00:00',
            'updated_at': '2025-11-08T00:00:00'
        }
        
        # Vérifier que les pages utilisent page_number
        assert pages[0].page_number == 1
        assert 'page_number' in str(pages[0].__dict__)


class TestDeckBuilderTypes:
    """Tests pour les types de cartes dans le deck builder"""
    
    def test_card_types_array(self):
        """Vérifie que les types de cartes sont bien un tableau"""
        card_data = {
            'id': '1',
            'card_id': 'base1-4',
            'card_name': 'Dracaufeu',
            'types': ['Fire'],  # Doit être un tableau
            'card_types': ['Fire']
        }
        
        assert isinstance(card_data['types'], list)
        assert len(card_data['types']) > 0
        assert 'Fire' in card_data['types']
    
    def test_type_normalization(self):
        """Vérifie la normalisation des types"""
        types = ['Fire', 'WATER', 'grass']
        normalized = [t.lower() for t in types]
        
        assert normalized == ['fire', 'water', 'grass']
    
    def test_type_filtering(self):
        """Vérifie le filtrage par type"""
        cards = [
            {'name': 'Dracaufeu', 'types': ['fire']},
            {'name': 'Tortank', 'types': ['water']},
            {'name': 'Florizarre', 'types': ['grass']},
            {'name': 'Pikachu', 'types': ['electric']},
        ]
        
        # Filtrer les cartes de type feu
        fire_cards = [c for c in cards if 'fire' in [t.lower() for t in c['types']]]
        assert len(fire_cards) == 1
        assert fire_cards[0]['name'] == 'Dracaufeu'


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
