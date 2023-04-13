import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokemonResponse } from './interfaces/PokemonResponse.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async execute() {
    const {data} = await this.axios.get<PokemonResponse>('https://pokeapi.co/api/v2/pokemon?limit=3')
    data.results.forEach(async({name, url}) => {
      const segments = url.split('/');
      const pokemonNumber: number = +segments[segments.length - 2];
      const pokemon = {
        name,
        number: pokemonNumber
      }
      await this.pokemonModel.create(pokemon)
    })

    return 'Seed executed';
  }
}
