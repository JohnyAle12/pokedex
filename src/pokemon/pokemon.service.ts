import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return pokemon;
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if(!isNaN(+term)){
      pokemon = await this.pokemonModel.findOne({
        number: term
      })
    }

    if(isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term)
    }

    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({
        name: term
      })
    }

    if(!pokemon) throw new NotFoundException(`Not found pokemon with ${term} param`)

    return pokemon
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    if(updatePokemonDto.name) updatePokemonDto.name = updatePokemonDto.name.toLowerCase()
    const pokemon = await this.findOne(term)

    try {
      await pokemon.updateOne(updatePokemonDto)
      return {
        ...pokemon.toJSON(),
        ...updatePokemonDto
      };
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  remove(id: number) {
    return `This action removes a #${id} pokemon`;
  }

  private handleExceptions(error: any){
    if(error.code === 11000){
      throw new BadRequestException(`Pokemon already exist in DB ${ JSON.stringify(error.keyValue) }`)
    }
    throw new InternalServerErrorException(`Can't create Pokemon, check server logs`)
  }
}
