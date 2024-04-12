import { Controller, Get, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { TransactionService } from './transaction.service';
import { AdminGuard } from '@guards/roles.guard';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@UseGuards(ThrottlerGuard)
@ApiTags('Transaction')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  /* Get specific user unique id */
  @AdminGuard()
  @Get('get/:id')
  async findOne(@Param('id') id: string): Promise<any> {
    const user = await this.transactionService.findById(id);
    return user;
  }

  /* Update specific transaction */
  // @AdminGuard()
  // @Patch('update/:id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() UpdateTransactionDto: UpdateTransactionDto,
  // ): Promise<UpdateTransactionDto> {
  //   const transation = await this.transactionService.updateTransaction(
  //     id,
  //     UpdateTransactionDto,
  //   );
  //   return transation;
  // }

  // /* Delete transaction */
  // @AdminGuard()
  // @Patch('delete/:id')
  // async delete(@Param('id') id: string) {
  //   await this.transactionService.de(id);
  // }
}
