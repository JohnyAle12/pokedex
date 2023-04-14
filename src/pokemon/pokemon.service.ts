import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';

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

  async findAll(paginationDto: PaginationDto) {
    const {limit = 10, offset = 0} = paginationDto
    return await this.pokemonModel.find()
      .select('-__v')
      .limit(limit)
      .skip(offset)
      .sort({
        number: 1
      })
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

  async remove(term: string) {
    // const pokemon = await this.findOne(term)
    // await pokemon.deleteOne()

    // we make sure for this option because with the new pipe we are secure to recive a term as a mongoId
    // Another reason is that we need make only one query to database
    // another option const pokemon = await this.pokemonModel.findByIdAndDelete(term)
    const { deletedCount } = await this.pokemonModel.deleteOne({_id: term})
    if(deletedCount === 0){
      throw new BadRequestException(`Not found pokemon with id ${term}`)
    }
  }

  private handleExceptions(error: any){
    if(error.code === 11000){
      throw new BadRequestException(`Pokemon already exist in DB ${ JSON.stringify(error.keyValue) }`)
    }
    throw new InternalServerErrorException(`Can't create Pokemon, check server logs`)
  }
}
