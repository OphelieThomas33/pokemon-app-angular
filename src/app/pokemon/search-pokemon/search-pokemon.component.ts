import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Pokemon } from '../pokemon';
import { Observable, Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { PokemonService } from '../pokemon.service';

@Component({
  selector: 'app-search-pokemon',
  templateUrl: './search-pokemon.component.html',
})
export class SearchPokemonComponent implements OnInit {
  // flux de données dans le temps (entrées dans le champmps) : {.."a"..."ab"...."abz"..."ab"..."abc"....}
  searchTerms = new Subject<string>();
  // {...pokemonList(a)...pokemonList(ab)....}
  pokemons$: Observable<Pokemon[]>

  constructor(
    private router: Router,
    private pokemonService: PokemonService
    ) {}

  ngOnInit(): void {
    // {.."a"."ab"."abz"."ab"."abc"......}
    // le but est de rechercher que les dernières données "abc"
    // en attendant un peu de temps avant de lancer la requête
    this.pokemons$ = this.searchTerms.pipe(
      // fonction permettant d'attendre (ici 300ms) et de ne garder que les données conservées pendant 300ms
      // si on efface rapidement l'erreur "abz", nous ne garderons pas cette info
      // ... "ab" .... "ab" .... "abc"
      debounceTime(300),
      // enlever les doublons 
      distinctUntilChanged(),
      switchMap((term) => this.pokemonService.searchPokemonList(term))
      // {....pokemonList(ab) ........pokemonList(abc) ...... } 

    )
  };

  search(term: string) {
    this.searchTerms.next(term);
  }

  goToDetail(pokemon: Pokemon) {
    const link = ['/pokemon', pokemon.id];
    this.router.navigate(link);
  }

}
