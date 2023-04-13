import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokemonResponse } from './interfaces/PokemonResponse.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { PokemonI } from './interfaces/Pokemon.interface';

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async execute() {
    this.resetCollection()

    const pokemons: PokemonI[] = []
    const {data} = await this.axios.get<PokemonResponse>('https://pokeapi.co/api/v2/pokemon?limit=650')
    data.results.forEach(async({name, url}) => {
      const segments = url.split('/');
      const pokemonNumber: number = +segments[segments.length - 2];
      pokemons.push({
        name,
        number: pokemonNumber
      })
    })

    await this.pokemonModel.insertMany(pokemons)
    
    return 'Seed executed';
  }

  private async resetCollection(): Promise<void>
  {
    await this.pokemonModel.deleteMany({})
  }
}
